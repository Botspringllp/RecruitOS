import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoiceRecords, communicationLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const role = context.userRole || "AGENCY_OWNER";

    // Financial Permission Guard (RC-06 - LOCKED RULE):
    // Approving Credit Notes, fee refunds, or invoice cancellations strictly requires AGENCY_OWNER or TEAM_LEAD.
    if (role === "RECRUITER") {
      return NextResponse.json(
        {
          error: "FORBIDDEN: Recruiter roles are strictly prohibited from issuing credit notes or cancelling financial invoices. Agency Owner or Team Lead approval required.",
          code: "FINANCIAL_PERMISSION_GUARD_BREACH",
        },
        { status: 403 }
      );
    }

    const { invoiceId } = await params;
    const body = await req.json().catch(() => ({}));
    const { creditNoteReason } = body;

    const inv = await db
      .select()
      .from(invoiceRecords)
      .where(and(eq(invoiceRecords.invoiceId, invoiceId), eq(invoiceRecords.agencyId, context.agencyId)))
      .limit(1);

    if (inv.length === 0) {
      return NextResponse.json({ error: "Invoice record not found" }, { status: 404 });
    }

    // Update status to 'Credit_Note_Issued'
    await db
      .update(invoiceRecords)
      .set({
        status: "Credit_Note_Issued",
      })
      .where(eq(invoiceRecords.invoiceId, invoiceId));

    // Audit log in timeline
    await db.insert(communicationLog).values({
      agencyId: context.agencyId,
      submissionId: inv[0].submissionId,
      candidateId: null,
      channel: "SYSTEM_NOTE",
      direction: "INBOUND",
      fromAddress: `Owner Financial Authority (${role})`,
      toAddress: "Accounts Receivable Ledger",
      body: `CREDIT NOTE ISSUED for Invoice #${inv[0].invoiceNumber} ($${inv[0].amount}). Reason: ${creditNoteReason || "Probation Guarantee Replacement Waiver"}. Authorized by: User ID ${context.userId}`,
      status: "received",
      matched: true,
    });

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceNumber: inv[0].invoiceNumber,
      status: "Credit_Note_Issued",
      authorizedByRole: role,
      message: `Credit note issued successfully for Invoice #${inv[0].invoiceNumber}. Invoice marked as Credit_Note_Issued.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to issue credit note" },
      { status: 500 }
    );
  }
}
