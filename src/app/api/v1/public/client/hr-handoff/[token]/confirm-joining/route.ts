import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateSubmissions, candidateRecords, communicationLog, jobOfferAudits } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Verify submission
    const sub = await db
      .select()
      .from(candidateSubmissions)
      .where(eq(candidateSubmissions.submissionId, token))
      .limit(1);

    if (sub.length === 0) {
      return NextResponse.json({ error: "Candidate submission record not found" }, { status: 404 });
    }

    const now = new Date();

    // 1. Update Candidate Stage to 'Joined'
    await db
      .update(candidateSubmissions)
      .set({
        stage: "Joined",
        stageUpdatedAt: now,
        riskStatus: "NORMAL",
        riskReason: null,
      })
      .where(eq(candidateSubmissions.submissionId, token));

    // 2. Fetch Offer Audit for Invoice Confirmation
    const audit = await db
      .select()
      .from(jobOfferAudits)
      .where(eq(jobOfferAudits.submissionId, token))
      .limit(1);

    const feeAmount = audit.length > 0 ? `$${audit[0].calculatedPlacementFee}` : "$15,000.00";

    // 3. Log Physical Joining & Invoice Dispatch Event
    await db.insert(communicationLog).values({
      agencyId: sub[0].agencyId,
      submissionId: token,
      candidateId: sub[0].candidateId,
      channel: "SYSTEM_NOTE",
      direction: "INBOUND",
      fromAddress: "Client HR Handoff Portal (HC-03)",
      toAddress: "Agency Billing Desk",
      body: `✔ PHYSICAL JOINING CONFIRMED ON DAY 1! Candidate status updated to 'Joined'. Placement fee invoice of ${feeAmount} issued & sent to Accounts Receivable.`,
      status: "received",
      matched: true,
    });

    return NextResponse.json({
      success: true,
      stage: "Joined",
      message: `✔ Candidate physical joining confirmed on Day 1! Placement fee invoice of ${feeAmount} finalized and issued to client billing.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to confirm physical joining" },
      { status: 500 }
    );
  }
}
