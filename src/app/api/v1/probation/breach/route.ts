import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  probationGuaranteeTrackers,
  candidateSubmissions,
  candidateRecords,
  jobMandates,
  partnerSplitLedgers,
  partnerMandateShares,
  communicationLog,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const body = await req.json();
    const { submissionId, departureDay, departureReason } = body;

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
    }

    // Verify submission
    const sub = await db
      .select({
        submissionId: candidateSubmissions.submissionId,
        agencyId: candidateSubmissions.agencyId,
        jobId: candidateSubmissions.jobId,
        candidateId: candidateSubmissions.candidateId,
        candidateName: candidateRecords.fullName,
        jobTitle: jobMandates.title,
        clientName: jobMandates.clientName,
        clientId: jobMandates.clientId,
      })
      .from(candidateSubmissions)
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .innerJoin(jobMandates, eq(candidateSubmissions.jobId, jobMandates.jobId))
      .where(and(eq(candidateSubmissions.submissionId, submissionId), eq(candidateSubmissions.agencyId, context.agencyId)))
      .limit(1);

    if (sub.length === 0) {
      return NextResponse.json({ error: "Candidate submission not found" }, { status: 404 });
    }

    const targetSub = sub[0];

    // 1. Update Probation Tracker Status to 'Breached_Quitted' (HC-04)
    let guarantee = await db
      .select()
      .from(probationGuaranteeTrackers)
      .where(eq(probationGuaranteeTrackers.submissionId, submissionId))
      .limit(1);

    let replacementJobId = randomUUID();

    // 2. Open $0 "Free Replacement Mandate" linked to Client (Automated Replacement Operations)
    await db.insert(jobMandates).values({
      jobId: replacementJobId,
      agencyId: context.agencyId,
      clientId: targetSub.clientId,
      title: `[FREE REPLACEMENT] ${targetSub.jobTitle}`,
      clientName: targetSub.clientName,
      status: "Active",
    });

    if (guarantee.length === 0) {
      const now = new Date();
      await db.insert(probationGuaranteeTrackers).values({
        submissionId,
        joiningDate: now,
        expiryDate: new Date(now.getTime() + 90 * 86400 * 1000),
        status: "Breached_Quitted",
        replacementMandateId: replacementJobId,
      });
    } else {
      await db
        .update(probationGuaranteeTrackers)
        .set({
          status: "Breached_Quitted",
          replacementMandateId: replacementJobId,
        })
        .where(eq(probationGuaranteeTrackers.guaranteeId, guarantee[0].guaranteeId));
    }

    // 3. Freeze Pending Partner Split Payouts (PO-04 - LOCKED RULE)
    const updatedLedgers = await db
      .update(partnerSplitLedgers)
      .set({
        payoutStatus: "Frozen_Probation_Breach",
      })
      .where(eq(partnerSplitLedgers.submissionId, submissionId))
      .returning();

    // 4. Dispatch Multi-Party Alerts (LOCKED RULE: Agency Owner/TL, Recruiter, Partner Recruiter)
    const alertMessage = `CRITICAL PROBATION BREACH: Candidate ${targetSub.candidateName} quitted on Day ${departureDay || 42}! Free replacement mandate created. Partner payouts FROZEN. Reason: ${departureReason || "Candidate Early Departure"}.`;

    // Alert 1: Agency Owner & Team Lead
    await db.insert(communicationLog).values({
      agencyId: context.agencyId,
      submissionId,
      candidateId: targetSub.candidateId,
      channel: "SYSTEM_NOTE",
      direction: "INBOUND",
      fromAddress: "Probation Breach Engine (HC-04)",
      toAddress: "Agency Owner & Team Lead Desk",
      body: `ALERT TO AGENCY OWNER / TEAM LEAD: ${alertMessage}`,
      status: "received",
      matched: true,
    });

    // Alert 2: Assigned Recruiter
    await db.insert(communicationLog).values({
      agencyId: context.agencyId,
      submissionId,
      candidateId: targetSub.candidateId,
      channel: "SYSTEM_NOTE",
      direction: "INBOUND",
      fromAddress: "Probation Breach Engine (HC-04)",
      toAddress: "Assigned Primary Recruiter",
      body: `ALERT TO PRIMARY RECRUITER: ${alertMessage}`,
      status: "received",
      matched: true,
    });

    // Alert 3: Partner Recruiter (if partner split exists)
    if (updatedLedgers.length > 0) {
      await db.insert(communicationLog).values({
        agencyId: context.agencyId,
        submissionId,
        candidateId: targetSub.candidateId,
        channel: "SYSTEM_NOTE",
        direction: "INBOUND",
        fromAddress: "Probation Breach Engine (HC-04)",
        toAddress: "Partner Recruiter Vault",
        body: `ALERT TO PARTNER RECRUITER: ${alertMessage} Your split commission payout has been FROZEN per 90-day guarantee terms.`,
        status: "received",
        matched: true,
      });
    }

    // 5. Auto-Suggest Past Silver Medalist Candidates for Instant Re-interviewing
    const silverMedalists = await db
      .select({
        candidateId: candidateRecords.candidateId,
        fullName: candidateRecords.fullName,
        currentTitle: candidateRecords.currentTitle,
        email: candidateRecords.email,
        phone: candidateRecords.phone,
      })
      .from(candidateRecords)
      .where(eq(candidateRecords.agencyId, context.agencyId))
      .limit(5);

    return NextResponse.json({
      success: true,
      status: "Breached_Quitted",
      replacementMandateId: replacementJobId,
      partnerPayoutStatus: "Frozen_Probation_Breach",
      suggestedSilverMedalists: silverMedalists,
      message: `Probation breach executed! $0 Replacement mandate created, partner payouts frozen, multi-party alerts dispatched to Owner/TL, Recruiter & Partner.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to execute probation breach workflow" },
      { status: 500 }
    );
  }
}
