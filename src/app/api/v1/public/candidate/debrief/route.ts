import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interviewDebriefs, interviewSchedules, candidateSubmissions, communicationLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interviewId, rating, interestLevel, candidateNotes, voiceNoteUrl } = body;

    if (!interviewId || !interestLevel) {
      return NextResponse.json(
        { error: "interviewId and interestLevel ('100% Excited' | 'Have Doubts' | 'Not Interested') are required." },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Rating must be an integer between 1 and 5 stars." }, { status: 400 });
    }

    // Verify interview schedule
    const interview = await db
      .select({
        interviewId: interviewSchedules.interviewId,
        submissionId: interviewSchedules.submissionId,
      })
      .from(interviewSchedules)
      .where(eq(interviewSchedules.interviewId, interviewId))
      .limit(1);

    if (interview.length === 0) {
      return NextResponse.json({ error: "Associated interview schedule not found" }, { status: 404 });
    }

    const targetSubId = interview[0].submissionId;

    // Insert Debrief Record
    const [debrief] = await db
      .insert(interviewDebriefs)
      .values({
        interviewId,
        rating: rating || 5,
        interestLevel,
        candidateNotes: candidateNotes || null,
        voiceNoteUrl: voiceNoteUrl || null,
      })
      .returning();

    // Fetch submission details for communication log linkage
    const sub = await db
      .select()
      .from(candidateSubmissions)
      .where(eq(candidateSubmissions.submissionId, targetSubId))
      .limit(1);

    if (sub.length > 0) {
      await db.insert(communicationLog).values({
        agencyId: sub[0].agencyId,
        submissionId: targetSubId,
        candidateId: sub[0].candidateId,
        channel: "WHATSAPP",
        direction: "INBOUND",
        fromAddress: "Candidate Mobile",
        toAddress: "Recruiter Feedback Desk",
        body: `Post-Interview Debrief Submitted: Rating: ${rating || 5}/5 ⭐ | Interest: ${interestLevel} | Notes: ${candidateNotes || "Voice Note Recorded"}`,
        status: "received",
        matched: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Post-interview debrief recorded successfully. Thank you for your feedback!",
      debriefId: debrief.debriefId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to record interview debrief" },
      { status: 500 }
    );
  }
}
