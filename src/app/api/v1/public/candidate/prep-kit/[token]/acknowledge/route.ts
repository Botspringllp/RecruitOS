import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interviewSchedules, communicationLog, candidateSubmissions } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find interview schedule
    const interview = await db
      .select({
        interviewId: interviewSchedules.interviewId,
        submissionId: interviewSchedules.submissionId,
      })
      .from(interviewSchedules)
      .where(or(eq(interviewSchedules.prepToken, token), eq(interviewSchedules.interviewId, token)))
      .limit(1);

    if (interview.length === 0) {
      return NextResponse.json({ error: "Interview schedule not found" }, { status: 404 });
    }

    const { interviewId, submissionId } = interview[0];

    // Mark candidate prep acknowledged
    await db
      .update(interviewSchedules)
      .set({
        candidatePrepAcknowledged: true,
        updatedAt: new Date(),
      })
      .where(eq(interviewSchedules.interviewId, interviewId));

    // Get submission for logging
    const sub = await db
      .select()
      .from(candidateSubmissions)
      .where(eq(candidateSubmissions.submissionId, submissionId))
      .limit(1);

    if (sub.length > 0) {
      await db.insert(communicationLog).values({
        agencyId: sub[0].agencyId,
        submissionId,
        candidateId: sub[0].candidateId,
        channel: "WHATSAPP",
        direction: "INBOUND",
        fromAddress: "Candidate Mobile",
        toAddress: "Agency Scheduler Bot",
        body: `Candidate T-24h Prep Kit Acknowledged! Status: "I've Reviewed & Feel Ready!"`,
        status: "received",
        matched: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Candidate interview readiness acknowledged successfully!",
      candidatePrepAcknowledged: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to acknowledge prep kit" },
      { status: 500 }
    );
  }
}
