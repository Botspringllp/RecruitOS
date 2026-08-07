import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interviewSchedules, candidateSubmissions, communicationLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const { submissionId } = await params;
    const body = await req.json();
    const { outcomeStatus, notes } = body;
    // outcomeStatus: 'Completed' | 'Rescheduled' | 'No_Show' | 'Rejected_Post_Interview'

    const validOutcomes = ["Completed", "Rescheduled", "No_Show", "Rejected_Post_Interview"];
    if (!outcomeStatus || !validOutcomes.includes(outcomeStatus)) {
      return NextResponse.json(
        { error: `outcomeStatus must be one of: ${validOutcomes.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify submission
    const sub = await db
      .select()
      .from(candidateSubmissions)
      .where(and(eq(candidateSubmissions.submissionId, submissionId), eq(candidateSubmissions.agencyId, context.agencyId)))
      .limit(1);

    if (sub.length === 0) {
      return NextResponse.json({ error: "Candidate submission not found" }, { status: 404 });
    }

    const now = new Date();

    // Find or create interview schedule record
    const existingInterviews = await db
      .select()
      .from(interviewSchedules)
      .where(eq(interviewSchedules.submissionId, submissionId))
      .limit(1);

    if (existingInterviews.length > 0) {
      await db
        .update(interviewSchedules)
        .set({
          outcomeStatus,
          updatedAt: now,
        })
        .where(eq(interviewSchedules.interviewId, existingInterviews[0].interviewId));
    } else {
      await db.insert(interviewSchedules).values({
        submissionId,
        outcomeStatus,
        createdAt: now,
        updatedAt: now,
      });
    }

    // LOCKED RULE: No-Show Handling Logic
    if (outcomeStatus === "No_Show") {
      await db
        .update(candidateSubmissions)
        .set({
          stage: "Interview No-Show / Action Required",
          riskStatus: "HIGH_RISK",
          riskReason: "Interview No-Show reported. Immediate recruiter investigation & rescheduling required.",
          stageUpdatedAt: now,
        })
        .where(eq(candidateSubmissions.submissionId, submissionId));

      await db.insert(communicationLog).values({
        agencyId: context.agencyId,
        submissionId,
        candidateId: sub[0].candidateId,
        channel: "SYSTEM_NOTE",
        direction: "INBOUND",
        fromAddress: "Interview Gatekeeper Engine",
        toAddress: "Recruiter Cockpit Daily Queue",
        body: `CRITICAL ALERT: Candidate reported Interview No-Show! High-priority task created for assigned recruiter to investigate & reschedule. Notes: ${notes || 'No notes provided.'}`,
        status: "received",
        matched: true,
      });

      return NextResponse.json({
        success: true,
        outcomeStatus,
        message: "Interview status logged as No_Show. Pipeline stage updated to 'Interview No-Show / Action Required' & high-priority cockpit task created.",
      });
    }

    if (outcomeStatus === "Rejected_Post_Interview") {
      await db
        .update(candidateSubmissions)
        .set({
          stage: "Rejected",
          rejectionReason: notes || "Declined post-interview technical evaluation.",
          stageUpdatedAt: now,
        })
        .where(eq(candidateSubmissions.submissionId, submissionId));
    } else if (outcomeStatus === "Completed") {
      await db
        .update(candidateSubmissions)
        .set({
          stageUpdatedAt: now,
        })
        .where(eq(candidateSubmissions.submissionId, submissionId));
    }

    // Log event to communication log
    await db.insert(communicationLog).values({
      agencyId: context.agencyId,
      submissionId,
      candidateId: sub[0].candidateId,
      channel: "SYSTEM_NOTE",
      direction: "INBOUND",
      fromAddress: "Recruiter Command Panel",
      toAddress: "Audit Timeline",
      body: `Interview outcome explicitly logged: ${outcomeStatus}. Notes: ${notes || "None"}`,
      status: "received",
      matched: true,
    });

    return NextResponse.json({
      success: true,
      outcomeStatus,
      message: `Interview outcome recorded successfully as '${outcomeStatus}'.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to record interview outcome" },
      { status: 500 }
    );
  }
}
