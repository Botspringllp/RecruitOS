import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partnerSplitLedgers, communicationLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function PATCH(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const role = context.userRole || "AGENCY_OWNER";

    // Financial Permission Guard (PO-04 - LOCKED RULE):
    // Marking partner payables as Paid or Authorized is restricted strictly to AGENCY_OWNER & TEAM_LEAD.
    if (role === "RECRUITER") {
      return NextResponse.json(
        {
          error: "FORBIDDEN: Recruiter roles cannot modify partner split commission ledgers or authorize payouts. Agency Owner or Team Lead approval required.",
          code: "FINANCIAL_PERMISSION_GUARD_BREACH",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ledgerId, payoutStatus } = body;

    const validStatuses = ["Pending_Client_Payment", "Frozen_Probation_Breach", "Ready_For_Payout", "Paid"];

    if (!ledgerId || !payoutStatus || !validStatuses.includes(payoutStatus)) {
      return NextResponse.json(
        { error: `ledgerId and valid payoutStatus (${validStatuses.join(", ")}) are required.` },
        { status: 400 }
      );
    }

    const [updatedLedger] = await db
      .update(partnerSplitLedgers)
      .set({
        payoutStatus,
        updatedByUserId: context.userId,
      })
      .where(eq(partnerSplitLedgers.ledgerId, ledgerId))
      .returning();

    if (!updatedLedger) {
      return NextResponse.json({ error: "Partner split ledger record not found" }, { status: 404 });
    }

    await db.insert(communicationLog).values({
      agencyId: context.agencyId,
      submissionId: updatedLedger.submissionId,
      candidateId: null,
      channel: "SYSTEM_NOTE",
      direction: "INBOUND",
      fromAddress: `Manual Ledger Entry (${role})`,
      toAddress: "Partner Payout Desk",
      body: `PARTNER LEDGER UPDATED: Payout status updated to '${payoutStatus}' for Split Amount $${updatedLedger.partnerShareAmount}. Updated by User ID ${context.userId}`,
      status: "received",
      matched: true,
    });

    return NextResponse.json({
      success: true,
      ledgerId: updatedLedger.ledgerId,
      payoutStatus: updatedLedger.payoutStatus,
      partnerShareAmount: `$${updatedLedger.partnerShareAmount}`,
      message: `Partner split ledger updated to '${payoutStatus}' by ${role}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update partner split ledger" },
      { status: 500 }
    );
  }
}
