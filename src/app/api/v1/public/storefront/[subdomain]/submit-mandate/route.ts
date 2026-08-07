import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { agencyStorefrontProfiles, inboundClientMandates, jobMandates } from "@/db/schema";
import { eq } from "drizzle-orm";

const submitMandateSchema = z.object({
  companyName: z.string().min(1, { message: "Company Name is required" }),
  contactName: z.string().min(1, { message: "Contact HR Name is required" }),
  contactEmail: z.string().email({ message: "Invalid contact email address" }),
  contactPhone: z.string().min(1, { message: "Contact phone number is required" }),
  jobTitle: z.string().min(1, { message: "Job Title is required" }),
  targetLocation: z.string().min(1, { message: "Job Location is required" }),
  minBudget: z.union([z.number(), z.string()]).nullable().optional(),
  maxBudget: z.union([z.number(), z.string()]).nullable().optional(),
  selectedTermType: z.string().default("Standard Contingency"),
  rawJdUrl: z.string().nullable().optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: any }
) {
  try {
    const params = await context.params;
    const subdomain = params?.subdomain;

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
    const result = submitMandateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Convert numeric fields safely to strings for database type safety
    const minBudgetStr = data.minBudget !== undefined && data.minBudget !== null ? data.minBudget.toString() : null;
    const maxBudgetStr = data.maxBudget !== undefined && data.maxBudget !== null ? data.maxBudget.toString() : null;

    // 3. Execute database transaction to guarantee atomicity of the mandate and the draft job creation
    const transactionResult = await db.transaction(async (tx) => {
      // Create draft job mandate record with status 'Unreviewed Inbound'
      const jobId = crypto.randomUUID();
      await tx.insert(jobMandates).values({
        jobId,
        agencyId: agencyId,
        title: data.jobTitle,
        clientName: data.companyName,
        status: "Unreviewed Inbound",
        createdAt: new Date(),
      });

      // Insert inbound client mandate record linked to the draft job
      const inboundId = crypto.randomUUID();
      await tx.insert(inboundClientMandates).values({
        inboundId,
        agencyId,
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        jobTitle: data.jobTitle,
        targetLocation: data.targetLocation,
        minBudget: minBudgetStr,
        maxBudget: maxBudgetStr,
        selectedTermType: data.selectedTermType,
        rawJdUrl: data.rawJdUrl || null,
        status: "Pending Agency Review",
        convertedJobId: jobId,
        createdAt: new Date(),
      });

      return { inboundId, jobId };
    });

    return NextResponse.json({
      success: true,
      message: "Mandate submitted successfully!",
      inboundId: transactionResult.inboundId,
      jobId: transactionResult.jobId,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Inbound mandate submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit mandate" },
      { status: 500 }
    );
  }
}
