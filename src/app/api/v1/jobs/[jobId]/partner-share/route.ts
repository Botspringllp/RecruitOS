import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/backend/auth/tenant-context";
import { withTenantTx } from "@/db";
import { jobMandates, jobPartnerShares } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "Job ID parameter is required" }, { status: 400 });
    }

    // 1. Resolve tenant context
    const tenant = await getTenantContext();
    if (!tenant.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }
    const { agencyId } = tenant;

    // 2. Parse request payload
    const body = await req.json().catch(() => ({}));
    const {
      partner_name,
      partner_email,
      maskedjob_title,
      masked_company_description,
      partner_split_percentage,
      expires_at,
    } = body;

    if (!partner_name || !partner_email) {
      return NextResponse.json(
        { error: "partner_name and partner_email are required" },
        { status: 400 }
      );
    }

    // 3. Execute database transaction
    const result = await withTenantTx(agencyId, async (tx) => {
      // Verify job mandate exists under the agency
      const jobList = await tx
        .select()
        .from(jobMandates)
        .where(and(eq(jobMandates.jobId, jobId), eq(jobMandates.agencyId, agencyId)))
        .limit(1);

      if (jobList.length === 0) {
        throw new Error("Job mandate not found or unauthorized");
      }
      const job = jobList[0];

      // Sanitization utility for descriptions (Regex Client Masking)
      const sanitizeDescription = (textToClean: string, clientName: string) => {
        let cleaned = textToClean || "";
        
        // Escape regex special chars in clientName
        const escapedClient = clientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const companyRegex = new RegExp(escapedClient, "gi");
        cleaned = cleaned.replace(companyRegex, "[Redacted Client Company]");
        
        // Emails regex
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        cleaned = cleaned.replace(emailRegex, "[Redacted Email]");
        
        // Phones regex
        const phoneRegex = /(\+?\d{1,4}[\s-])?(\(?\d{2,4}\)?[\s-])?\d{3,4}[\s-]\d{3,4}/g;
        cleaned = cleaned.replace(phoneRegex, "[Redacted Contact]");
        
        // URLs regex
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
        cleaned = cleaned.replace(urlRegex, "[Redacted URL]");

        return cleaned;
      };

      // Auto-fallback values if not customized
      const finalMaskedTitle = maskedjob_title || `Sanitized Role — ${job.title}`;
      const finalMaskedDescription = masked_company_description 
        ? sanitizeDescription(masked_company_description, job.clientName)
        : sanitizeDescription(`We are recruiting for a ${job.title} on behalf of our client, ${job.clientName}. Contact us at info@recruit.com for applications.`, job.clientName);

      const partnerSplit = partner_split_percentage !== undefined ? Number(partner_split_percentage) : 50.00;
      const agencySplit = 100.00 - partnerSplit;

      // Generate secure 128-bit random token (32 hex characters)
      const rawToken = randomBytes(16).toString("hex");
      const accessTokenHash = createHash("sha256").update(rawToken).digest("hex");

      // Set expiration: default to 14 days
      const expirationDate = expires_at ? new Date(expires_at) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      // Save share record
      await tx.insert(jobPartnerShares).values({
        shareId: crypto.randomUUID(),
        jobId,
        agencyId,
        partnerName: partner_name,
        partnerEmail: partner_email,
        maskedJobTitle: finalMaskedTitle,
        maskedCompanyDescription: finalMaskedDescription,
        agencySplitPercentage: agencySplit.toFixed(2),
        partnerSplitPercentage: partnerSplit.toFixed(2),
        accessTokenHash,
        expiresAt: expirationDate,
      });

      return { rawToken, finalMaskedTitle, finalMaskedDescription };
    });

    return NextResponse.json({
      success: true,
      message: "Anonymized partner share link successfully generated",
      rawToken: result.rawToken,
      magicLink: `/public/partner-share/${result.rawToken}`,
      maskedTitle: result.finalMaskedTitle,
      maskedDescription: result.finalMaskedDescription
    });

  } catch (error: any) {
    console.error("Partner share generation failure:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate anonymized partner share" },
      { status: 500 }
    );
  }
}
