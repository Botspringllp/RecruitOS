import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/backend/auth/tenant-context";
import { withTenantTx } from "@/db";
import { partnerMandateShares, jobMandates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// SHA-256 Helper to secure tokens at rest
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Regex utility to sanitize contact details and domains from description
function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[masked-email]") // Email addresses
    .replace(/(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g, "[masked-phone]") // Phone numbers
    .replace(/https?:\/\/[^\s]+/g, "[masked-link]"); // Web links
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "Job ID parameter is required" }, { status: 400 });
    }

    // 1. Resolve and enforce tenant isolation
    const tenant = await getTenantContext();
    if (!tenant.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }
    const { agencyId } = tenant;

    // 2. Parse request payload
    const body = await req.json().catch(() => ({}));
    const {
      partner_email,
      partner_name,
      masked_job_title,
      masked_company_description,
      partner_split_percentage = 50.00,
      expires_in_days = 30
    } = body;

    if (!partner_email || !masked_job_title || !masked_company_description) {
      return NextResponse.json(
        { error: "Missing required fields: partner_email, masked_job_title, masked_company_description" },
        { status: 400 }
      );
    }

    // 3. Save partner share link using withTenantTx transaction context
    const result = await withTenantTx(agencyId, async (tx) => {
      // Confirm job mandate belongs to this agency
      const jobList = await tx
        .select()
        .from(jobMandates)
        .where(and(eq(jobMandates.jobId, jobId), eq(jobMandates.agencyId, agencyId)))
        .limit(1);

      if (jobList.length === 0) {
        throw new Error("Job mandate not found or unauthorized access");
      }

      // PO-01 Role Enforcement: Restricted to Owner, Admin, Team Lead, OR Assigned Recruiter
      const userRoleHeader = req.headers.get("x-user-role");
      let userRole = userRoleHeader || "recruiter";

      // PO-01 RULE: Check if standard recruiter is the assigned recruiter
      const allowedRoles = ["owner", "admin", "team_lead"];
      if (!allowedRoles.includes(userRole.toLowerCase())) {
        if (jobList[0].assignedRecruiterId !== tenant.userId) {
           throw new Error("Forbidden: Restricted to Agency Owners, Team Leads, or the Assigned Recruiter for this mandate (PO-01 Rule).");
        }
      }

      // Generate cryptographically secure token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const accessTokenHash = hashToken(rawToken);

      // Expiry timestamp
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(expires_in_days));

      // Auto-sanitize description inputs
      const cleanDescription = sanitizeText(masked_company_description);
      const cleanTitle = sanitizeText(masked_job_title);

      const agencySplit = (100 - Number(partner_split_percentage)).toFixed(2);
      const partnerSplit = Number(partner_split_percentage).toFixed(2);

      const newShare = await tx
        .insert(partnerMandateShares)
        .values({
          shareId: crypto.randomUUID(),
          agencyId,
          jobId,
          partnerEmail: partner_email,
          partnerName: partner_name || null,
          maskedJobTitle: cleanTitle,
          maskedCompanyDescription: cleanDescription,
          agencySplitPercentage: agencySplit,
          partnerSplitPercentage: partnerSplit,
          accessTokenHash,
          expiresAt,
          isActive: true,
        })
        .returning();

      return {
        share: newShare[0],
        rawToken
      };
    });

    // Formulate magic collaboration link
    const origin = req.nextUrl.origin || "http://localhost:3000";
    const magicLink = `${origin}/partner-vault/${result.rawToken}`;

    return NextResponse.json({
      success: true,
      message: "Encrypted partner sharing link successfully generated",
      shareId: result.share.shareId,
      magicLink,
      expiresAt: result.share.expiresAt,
    });

  } catch (error: any) {
    console.error("Partner share generation failure:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create partner share link" },
      { status: 500 }
    );
  }
}
