import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateRecords, candidateSubmissions, communicationLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function POST(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const { agencyId, userId } = context;
    const body = await req.json();

    const { submissionId, candidateId, channel, direction, messageBody, sentByUserId } = body;

    if (!messageBody || !channel) {
      return NextResponse.json({ error: "Channel and message body are required" }, { status: 400 });
    }

    let targetCandidateId = candidateId;
    let targetSubmissionId = submissionId;

    // If submissionId is provided, resolve candidateId if missing
    if (targetSubmissionId && !targetCandidateId) {
      const sub = await db
        .select({ candidateId: candidateSubmissions.candidateId })
        .from(candidateSubmissions)
        .where(eq(candidateSubmissions.submissionId, targetSubmissionId))
        .limit(1);
      if (sub.length > 0) {
        targetCandidateId = sub[0].candidateId;
      }
    }

    // Insert into communication_log
    const [log] = await db
      .insert(communicationLog)
      .values({
        agencyId,
        submissionId: targetSubmissionId || null,
        candidateId: targetCandidateId || null,
        sentByUserId: sentByUserId || userId || null,
        channel: String(channel).toUpperCase(), // 'WHATSAPP' | 'EMAIL' | 'SYSTEM_NOTE'
        direction: direction ? String(direction).toUpperCase() : "OUTBOUND", // 'INBOUND' | 'OUTBOUND'
        fromAddress: "Agency Cockpit",
        toAddress: "Candidate Direct",
        body: messageBody,
        status: "sent",
        matched: true,
      })
      .returning();

    // Update candidate_submissions.last_communication_at if submissionId present
    if (targetSubmissionId) {
      await db
        .update(candidateSubmissions)
        .set({
          lastCommunicationAt: new Date(),
        })
        .where(eq(candidateSubmissions.submissionId, targetSubmissionId));
    }

    return NextResponse.json({
      success: true,
      message: "Communication dispatched and logged successfully",
      logId: log.messageId,
      log,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to dispatch communication" },
      { status: 500 }
    );
  }
}
