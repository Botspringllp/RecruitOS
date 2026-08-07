import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { noticePeriodPulseLogs, candidateSubmissions, candidateRecords, communicationLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Fetch all pending / unresponded pulse logs
    const pendingPulses = await db
      .select({
        pulseId: noticePeriodPulseLogs.pulseId,
        submissionId: noticePeriodPulseLogs.submissionId,
        touchpointDay: noticePeriodPulseLogs.touchpointDay,
        unrespondedAttempts: noticePeriodPulseLogs.unrespondedAttempts,
        agencyId: candidateSubmissions.agencyId,
        candidateId: candidateSubmissions.candidateId,
        candidateName: candidateRecords.fullName,
      })
      .from(noticePeriodPulseLogs)
      .innerJoin(candidateSubmissions, eq(noticePeriodPulseLogs.submissionId, candidateSubmissions.submissionId))
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .where(eq(noticePeriodPulseLogs.responseStatus, "Pending"));

    let attempt1Count = 0;
    let attempt2Count = 0;

    for (const pulse of pendingPulses) {
      if (pulse.unrespondedAttempts === 0) {
        // 1st Unresponded Attempt (48 Hours) - LOCKED RULE
        // Shift candidate risk score to HIGH (Red Warning Banner) in Recruiter Daily Cockpit
        await db
          .update(candidateSubmissions)
          .set({
            riskStatus: "HIGH_RISK",
            riskReason: `HIGH RISK: Unresponded to 1st Pulse Check Attempt (Day ${pulse.touchpointDay}). Candidate dark — Call immediately.`,
          })
          .where(eq(candidateSubmissions.submissionId, pulse.submissionId));

        await db
          .update(noticePeriodPulseLogs)
          .set({
            unrespondedAttempts: 1,
            escalatedToRole: "RECRUITER",
            responseStatus: "Unresponded",
          })
          .where(eq(noticePeriodPulseLogs.pulseId, pulse.pulseId));

        await db.insert(communicationLog).values({
          agencyId: pulse.agencyId,
          submissionId: pulse.submissionId,
          candidateId: pulse.candidateId,
          channel: "SYSTEM_NOTE",
          direction: "INBOUND",
          fromAddress: "Notice Retention Radar",
          toAddress: "Recruiter Cockpit Action Queue",
          body: `URGENT TASK: Candidate ${pulse.candidateName} dark on Day ${pulse.touchpointDay} pulse check — Call immediately! (1st Unresponded Attempt)`,
          status: "received",
          matched: true,
        });

        attempt1Count++;
      } else if (pulse.unrespondedAttempts === 1) {
        // 2nd Consecutive Unresponded Attempt - LOCKED RULE
        // System dispatches automated escalation alert directly to Agency Owner / Team Lead
        await db
          .update(candidateSubmissions)
          .set({
            riskStatus: "HIGH_RISK",
            riskReason: `CRITICAL REVENUE RISK: Unresponded to 2nd Pulse Check Attempt (Day ${pulse.touchpointDay}). Escalated to Team Lead!`,
          })
          .where(eq(candidateSubmissions.submissionId, pulse.submissionId));

        await db
          .update(noticePeriodPulseLogs)
          .set({
            unrespondedAttempts: 2,
            escalatedToRole: "TEAM_LEAD",
            responseStatus: "Unresponded",
          })
          .where(eq(noticePeriodPulseLogs.pulseId, pulse.pulseId));

        await db.insert(communicationLog).values({
          agencyId: pulse.agencyId,
          submissionId: pulse.submissionId,
          candidateId: pulse.candidateId,
          channel: "SYSTEM_NOTE",
          direction: "INBOUND",
          fromAddress: "2-Tier Retention Escalator",
          toAddress: "Team Lead & Agency Owner Command Desk",
          body: `ESCALATION NOTICE: Candidate ${pulse.candidateName} unresponded to 2nd consecutive pulse check on Day ${pulse.touchpointDay}! Escalated to Team Lead to protect placement revenue.`,
          status: "received",
          matched: true,
        });

        attempt2Count++;
      }
    }

    return NextResponse.json({
      success: true,
      pendingPulsesScanned: pendingPulses.length,
      recruiterAlertsTriggered: attempt1Count,
      teamLeadEscalationsTriggered: attempt2Count,
      message: `2-Tier Notice Pulse Escalation scan completed. ${attempt1Count} Recruiter Alerts & ${attempt2Count} Team Lead Escalations issued.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to run notice pulse escalation cron" },
      { status: 500 }
    );
  }
}
