import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interviewSchedules, candidateSubmissions, candidateRecords, communicationLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const fourHoursFromNow = new Date(Date.now() + 4 * 3600 * 1000);

    // Fetch scheduled interviews occurring in the next 4 hours where prep is NOT acknowledged
    const unpreppedInterviews = await db
      .select({
        interviewId: interviewSchedules.interviewId,
        submissionId: interviewSchedules.submissionId,
        candidatePrepAcknowledged: interviewSchedules.candidatePrepAcknowledged,
        candidateName: candidateRecords.fullName,
        candidatePhone: candidateRecords.phone,
        agencyId: candidateSubmissions.agencyId,
        candidateId: candidateSubmissions.candidateId,
      })
      .from(interviewSchedules)
      .innerJoin(candidateSubmissions, eq(interviewSchedules.submissionId, candidateSubmissions.submissionId))
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .where(
        and(
          eq(interviewSchedules.outcomeStatus, "Scheduled"),
          eq(interviewSchedules.candidatePrepAcknowledged, false)
        )
      );

    let alertsSent = 0;

    for (const item of unpreppedInterviews) {
      // 1. Dispatch Urgent WhatsApp Reminder to Candidate
      await db.insert(communicationLog).values({
        agencyId: item.agencyId,
        submissionId: item.submissionId,
        candidateId: item.candidateId,
        channel: "WHATSAPP",
        direction: "OUTBOUND",
        fromAddress: "Agency Interview Readiness Bot",
        toAddress: item.candidatePhone || "Candidate Mobile",
        body: `URGENT PREP REMINDER: Your TechCorp interview is starting in less than 4 hours! Please tap here to review your Coaching & Prep Kit: http://localhost:3000/prep-kit/${item.interviewId}`,
        status: "sent",
        matched: true,
      });

      // 2. Flag candidate as HIGH_RISK in Recruiter Cockpit
      await db
        .update(candidateSubmissions)
        .set({
          riskStatus: "HIGH_RISK",
          riskReason: `T-4 Hours Unprepped Alert: Candidate ${item.candidateName} has not acknowledged their interview preparation kit!`,
        })
        .where(eq(candidateSubmissions.submissionId, item.submissionId));

      alertsSent++;
    }

    return NextResponse.json({
      success: true,
      unpreppedScanCount: unpreppedInterviews.length,
      alertsSent,
      message: `Unprepped alert scan complete. ${alertsSent} urgent reminders & cockpit alerts triggered.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to run interview prep reminders cron" },
      { status: 500 }
    );
  }
}
