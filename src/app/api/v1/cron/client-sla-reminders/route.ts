import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateSubmissions, clientPortalTokens, jobMandates, communicationLog, candidateRecords } from "@/db/schema";
import { eq, and, lte, gt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600 * 1000);
    const now = new Date();

    // Fetch candidate submissions in 'Submitted' stage for > 24 hours
    const staleSubmissions = await db
      .select({
        submissionId: candidateSubmissions.submissionId,
        agencyId: candidateSubmissions.agencyId,
        jobId: candidateSubmissions.jobId,
        candidateId: candidateSubmissions.candidateId,
        stageUpdatedAt: candidateSubmissions.stageUpdatedAt,
        candidateName: candidateRecords.fullName,
        jobTitle: jobMandates.title,
        clientName: jobMandates.clientName,
        primaryHrEmail: jobMandates.primaryHrEmail,
        primaryHrPhone: jobMandates.primaryHrPhone,
      })
      .from(candidateSubmissions)
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .innerJoin(jobMandates, eq(candidateSubmissions.jobId, jobMandates.jobId))
      .where(
        and(
          eq(candidateSubmissions.stage, "Submitted"),
          lte(candidateSubmissions.stageUpdatedAt, twentyFourHoursAgo)
        )
      );

    let remindersDispatched = 0;

    for (const sub of staleSubmissions) {
      // Find active client portal token for job
      const activeToken = await db
        .select()
        .from(clientPortalTokens)
        .where(
          and(
            eq(clientPortalTokens.jobId, sub.jobId),
            gt(clientPortalTokens.expiresAt, now)
          )
        )
        .limit(1);

      if (activeToken.length > 0) {
        const reviewUrl = `http://localhost:3000/portal/${activeToken[0].tokenHash}`;

        // Dispatch polite WhatsApp nudge
        await db.insert(communicationLog).values({
          agencyId: sub.agencyId,
          submissionId: sub.submissionId,
          candidateId: sub.candidateId,
          channel: "WHATSAPP",
          direction: "OUTBOUND",
          fromAddress: "Agency Client SLA Bot",
          toAddress: sub.primaryHrPhone || sub.primaryHrEmail || "Client HR",
          body: `Hi ${sub.clientName || 'Hiring Team'}, gentle reminder regarding candidate ${sub.candidateName} for '${sub.jobTitle}'. Please review and submit your shortlist decision here: ${reviewUrl}`,
          status: "sent",
          matched: true,
        });

        remindersDispatched++;
      }
    }

    return NextResponse.json({
      success: true,
      staleSubmissionsCount: staleSubmissions.length,
      remindersDispatched,
      message: `CF-04 Client SLA Reminder Scan Complete. ${remindersDispatched} client nudges dispatched.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to execute client SLA reminders cron" },
      { status: 500 }
    );
  }
}
