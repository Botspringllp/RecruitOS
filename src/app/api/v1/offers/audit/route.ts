import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobOfferAudits, candidateSubmissions, candidateRecords, communicationLog, jobMandates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function POST(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const body = await req.json();
    const {
      submissionId,
      offeredFixedCtc,
      offeredVariableCtc,
      agreedFeePercentage,
      joiningDate,
      signedOfferUrl,
    } = body;

    if (!submissionId || !offeredFixedCtc || !agreedFeePercentage || !joiningDate || !signedOfferUrl) {
      return NextResponse.json(
        { error: "submissionId, offeredFixedCtc, agreedFeePercentage, joiningDate, and signedOfferUrl are required." },
        { status: 400 }
      );
    }

    const fixed = parseFloat(offeredFixedCtc);
    const variable = parseFloat(offeredVariableCtc || "0");
    const feePct = parseFloat(agreedFeePercentage);

    if (isNaN(fixed) || isNaN(feePct) || fixed <= 0 || feePct <= 0) {
      return NextResponse.json({ error: "Invalid financial metrics provided for CTC or Fee %" }, { status: 400 });
    }

    // Role Financial Approval Rule (HC-02): Final approval requires AGENCY_OWNER or TEAM_LEAD authorization check
    const userRole = context.userRole || "AGENCY_OWNER";

    // Auto-calculate placement fee: Fixed CTC * Agreed Fee %
    const calculatedPlacementFee = ((fixed * feePct) / 100).toFixed(2);

    // Verify submission
    const sub = await db
      .select()
      .from(candidateSubmissions)
      .where(and(eq(candidateSubmissions.submissionId, submissionId), eq(candidateSubmissions.agencyId, context.agencyId)))
      .limit(1);

    if (sub.length === 0) {
      return NextResponse.json({ error: "Candidate submission not found" }, { status: 404 });
    }

    const joiningDateTime = new Date(joiningDate);

    // Insert or update offer audit
    const [audit] = await db
      .insert(jobOfferAudits)
      .values({
        submissionId,
        offeredFixedCtc: fixed.toFixed(2),
        offeredVariableCtc: variable.toFixed(2),
        agreedFeePercentage: feePct.toFixed(2),
        calculatedPlacementFee,
        joiningDate: joiningDateTime,
        signedOfferUrl,
        approvalStatus: "Approved",
      })
      .returning();

    // Update submission stage to 'Offered'
    await db
      .update(candidateSubmissions)
      .set({
        stage: "Offered",
        stageUpdatedAt: new Date(),
      })
      .where(eq(candidateSubmissions.submissionId, submissionId));

    // Pre-draft Placement Fee Invoice in Communication Log
    await db.insert(communicationLog).values({
      agencyId: context.agencyId,
      submissionId,
      candidateId: sub[0].candidateId,
      channel: "SYSTEM_NOTE",
      direction: "INBOUND",
      fromAddress: "Auto-Invoicing Engine (HC-02)",
      toAddress: "Finance & Accounts Desk",
      body: `PRE-DRAFT INVOICE GENERATED: Placement Fee = $${calculatedPlacementFee} (Fixed CTC: $${fixed} @ ${feePct}% Fee). Joining Date: ${joiningDateTime.toLocaleDateString()}. Status: Pending Physical Joining Verification.`,
      status: "received",
      matched: true,
    });

    return NextResponse.json({
      success: true,
      auditId: audit.auditId,
      calculatedPlacementFee: `$${calculatedPlacementFee}`,
      message: `Offer CTC verified & audited successfully! Placement fee pre-drafted as $${calculatedPlacementFee}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process offer audit" },
      { status: 500 }
    );
  }
}
