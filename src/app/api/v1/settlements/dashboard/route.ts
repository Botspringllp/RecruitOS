import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  invoiceRecords,
  probationGuaranteeTrackers,
  partnerSplitLedgers,
  candidateSubmissions,
  candidateRecords,
  jobMandates,
  clientRecords,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function GET(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    // 1. Fetch Invoices
    const invoices = await db
      .select({
        invoiceId: invoiceRecords.invoiceId,
        invoiceNumber: invoiceRecords.invoiceNumber,
        amount: invoiceRecords.amount,
        status: invoiceRecords.status,
        issuedAt: invoiceRecords.issuedAt,
        paidAt: invoiceRecords.paidAt,
        clientName: clientRecords.companyName,
        candidateName: candidateRecords.fullName,
      })
      .from(invoiceRecords)
      .innerJoin(clientRecords, eq(invoiceRecords.clientId, clientRecords.clientId))
      .innerJoin(candidateSubmissions, eq(invoiceRecords.submissionId, candidateSubmissions.submissionId))
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .where(eq(invoiceRecords.agencyId, context.agencyId));

    // 2. Fetch Probation Trackers
    const guarantees = await db
      .select({
        guaranteeId: probationGuaranteeTrackers.guaranteeId,
        submissionId: probationGuaranteeTrackers.submissionId,
        joiningDate: probationGuaranteeTrackers.joiningDate,
        expiryDate: probationGuaranteeTrackers.expiryDate,
        status: probationGuaranteeTrackers.status,
        candidateName: candidateRecords.fullName,
        jobTitle: jobMandates.title,
        clientName: jobMandates.clientName,
      })
      .from(probationGuaranteeTrackers)
      .innerJoin(candidateSubmissions, eq(probationGuaranteeTrackers.submissionId, candidateSubmissions.submissionId))
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .innerJoin(jobMandates, eq(candidateSubmissions.jobId, jobMandates.jobId))
      .where(eq(candidateSubmissions.agencyId, context.agencyId));

    // 3. Fetch Partner Split Ledgers
    const ledgers = await db
      .select({
        ledgerId: partnerSplitLedgers.ledgerId,
        partnerShareAmount: partnerSplitLedgers.partnerShareAmount,
        payoutStatus: partnerSplitLedgers.payoutStatus,
        candidateName: candidateRecords.fullName,
        jobTitle: jobMandates.title,
      })
      .from(partnerSplitLedgers)
      .innerJoin(candidateSubmissions, eq(partnerSplitLedgers.submissionId, candidateSubmissions.submissionId))
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .innerJoin(jobMandates, eq(candidateSubmissions.jobId, jobMandates.jobId))
      .where(eq(candidateSubmissions.agencyId, context.agencyId));

    // Summary Cards Calculation
    const unbilledPlacementsCount = invoices.filter((i) => i.status === "Draft" || i.status === "Sent").length;
    const activeGuaranteesCount = guarantees.filter((g) => g.status === "Active_Probation").length;
    const frozenSplitPayoutsCount = ledgers.filter((l) => l.payoutStatus === "Frozen_Probation_Breach").length;

    return NextResponse.json({
      success: true,
      summaryCards: {
        unbilledPlacements: unbilledPlacementsCount,
        activeGuarantees: activeGuaranteesCount,
        frozenSplitPayouts: frozenSplitPayoutsCount,
      },
      invoices,
      guarantees,
      ledgers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch settlement dashboard data" },
      { status: 500 }
    );
  }
}
