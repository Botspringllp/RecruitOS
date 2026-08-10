import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { agencyStorefrontProfiles, inboundClientMandates, jobMandates } from "@/db/schema";
import { eq } from "drizzle-orm";

const requestTalentSchema = z.object({
  showcase_id: z.string().optional(),
  candidate_id: z.string().optional(),
  employer_name: z.string().min(1, { message: "Employer Name is required" }),
  employer_email: z.string().email({ message: "Invalid work email address" }),
  company_name: z.string().min(1, { message: "Company Name is required" }),
  phone: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;

    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain is required" }, { status: 400 });
    }

    // 1. Resolve agency_id from subdomain
    const profileResult = await db
      .select({ agencyId: agencyStorefrontProfiles.agencyId })
      .from(agencyStorefrontProfiles)
      .where(eq(agencyStorefrontProfiles.subdomain, subdomain))
      .limit(1);

    if (profileResult.length === 0) {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
    }

    const { agencyId } = profileResult[0];

    // 2. Validate request payload
    const body = await req.json();
    const result = requestTalentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // 3. Create inbound client mandate lead for requested talent
    const inboundId = crypto.randomUUID();
    const jobId = crypto.randomUUID();
    const candidateRef = data.candidate_id || data.showcase_id || "Pre-Vetted Executive";

    await db.transaction(async (tx) => {
      // Create draft job mandate record
      await tx.insert(jobMandates).values({
        jobId,
        agencyId,
        title: `Talent Request: ${candidateRef}`,
        clientName: data.company_name,
        status: "Unreviewed Inbound",
        createdAt: new Date(),
      });

      // Create inbound mandate lead
      await tx.insert(inboundClientMandates).values({
        inboundId,
        agencyId,
        companyName: data.company_name,
        contactName: data.employer_name,
        contactEmail: data.employer_email,
        contactPhone: data.phone || "Not Provided",
        jobTitle: `Showcase Candidate Request (${candidateRef})`,
        targetLocation: "As per client requirement",
        selectedTermType: "Talent Showcase Inquiry",
        status: "Pending Agency Review",
        convertedJobId: jobId,
        createdAt: new Date(),
      });
    });

    return NextResponse.json({
      success: true,
      message: "Candidate profile request received! A Senior Recruiter will share full details shortly.",
      inboundId,
      jobId
    }, { status: 201 });

  } catch (error: any) {
    console.error("Talent showcase request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process candidate request" },
      { status: 500 }
    );
  }
}
