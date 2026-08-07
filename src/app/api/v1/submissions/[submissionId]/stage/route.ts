import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateSubmissions, interviewSchedules, communicationLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function PATCH(
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
    const { targetStage, isOwnerOverride, overrideReason } = body;

    if (!targetStage) {
      return NextResponse.json({ error: "targetStage is required." }, { status: 400 });
    }

    // Fetch submission
    const sub = await db
      .select()
      .from(candidateSubmissions)
      .where(and(eq(candidateSubmissions.submissionId, submissionId), eq(candidateSubmissions.agencyId, context.agencyId)))
      .limit(1);

    if (sub.length === 0) {
      return NextResponse.json({ error: "Candidate submission not found" }, { status: 404 });
    }

    // STRICT STAGE-GATE ENFORCEMENT (LOCKED RULE)
    // Moving to 'Offered' or 'Joined' requires explicit interview outcome recorded (Completed / Rescheduled / Rejected)
    if (["Offered", "Joined"].includes(targetStage)) {
      const interview = await db
        .select()
        .from(interviewSchedules)
        .where(eq(interviewSchedules.submissionId, submissionId))
        .limit(1);

      const hasRecordedOutcome =
        interview.length > 0 && interview[0].outcomeStatus !== "Scheduled";

      if (!hasRecordedOutcome) {
        const role = context.userRole || "AGENCY_OWNER";
        if (isOwnerOverride && (role === "AGENCY_OWNER" || role === "TEAM_LEAD" || role === "GLOBAL_ADMIN")) {
          // Allowed with audit logging
          await db.insert(communicationLog).values({
            agencyId: context.agencyId,
            submissionId,
            candidateId: sub[0].candidateId,
            channel: "SYSTEM_NOTE",
            direction: "INBOUND",
            fromAddress: `Owner Override (${role})`,
            toAddress: "Audit Log",
            body: `STAGE-GATE BYPASS OVERRIDE: Allowed transition to '${targetStage}' without completed interview outcome. Reason: ${overrideReason || 'Owner Discretion'}`,
            status: "received",
            matched: true,
          });
        } else {
          return NextResponse.json(
            {
              error:
                "STRICT STAGE-GATE BREACH: Cannot advance candidate to 'Offered' or 'Joined' until an explicit interview outcome (Completed, Rescheduled, No_Show) is recorded. Owner/Team Lead override authorization required.",
              code: "STAGE_GATE_BLOCKED",
              requiresOutcomeRecord: true,
            },
            { status: 403 }
          );
        }
      }
    }

    // Update Stage
    const now = new Date();
    await db
      .update(candidateSubmissions)
      .set({
        stage: targetStage,
        stageUpdatedAt: now,
      })
      .where(eq(candidateSubmissions.submissionId, submissionId));

    return NextResponse.json({
      success: true,
      submissionId,
      newStage: targetStage,
      message: `Candidate stage updated successfully to '${targetStage}'.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update submission stage" },
      { status: 500 }
    );
  }
}
