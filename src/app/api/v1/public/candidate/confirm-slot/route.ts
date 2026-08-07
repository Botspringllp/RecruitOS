import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateSubmissions, proposedInterviewSlots, communicationLog, candidateRecords } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, slotId, action, preferredTimes } = body;
    // action: 'CONFIRM_SLOT' | 'REQUEST_ALTERNATIVE_SLOTS'

    if (!submissionId || !action) {
      return NextResponse.json(
        { error: "submissionId and action ('CONFIRM_SLOT' | 'REQUEST_ALTERNATIVE_SLOTS') are required." },
        { status: 400 }
      );
    }

    // Verify submission
    const sub = await db
      .select({
        submissionId: candidateSubmissions.submissionId,
        agencyId: candidateSubmissions.agencyId,
        candidateId: candidateSubmissions.candidateId,
        fullName: candidateRecords.fullName,
        phone: candidateRecords.phone,
      })
      .from(candidateSubmissions)
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .where(eq(candidateSubmissions.submissionId, submissionId))
      .limit(1);

    if (sub.length === 0) {
      return NextResponse.json({ error: "Candidate submission not found" }, { status: 404 });
    }

    const targetSub = sub[0];

    if (action === "CONFIRM_SLOT") {
      if (!slotId) {
        return NextResponse.json({ error: "slotId is required to lock in an interview slot." }, { status: 400 });
      }

      // Update selected slot to Accepted
      await db
        .update(proposedInterviewSlots)
        .set({ status: "Accepted" })
        .where(eq(proposedInterviewSlots.slotId, slotId));

      // Mark other slots for this submission as RejectedByCandidate
      await db
        .update(proposedInterviewSlots)
        .set({ status: "RejectedByCandidate" })
        .where(
          and(
            eq(proposedInterviewSlots.submissionId, submissionId),
            // not eq slotId
          )
        );

      // Lock stage to Interviewing & update last communication
      await db
        .update(candidateSubmissions)
        .set({
          stage: "Interviewing",
          stageUpdatedAt: new Date(),
          lastCommunicationAt: new Date(),
        })
        .where(eq(candidateSubmissions.submissionId, submissionId));

      // Log Confirmation Event
      await db.insert(communicationLog).values({
        agencyId: targetSub.agencyId,
        submissionId,
        candidateId: targetSub.candidateId,
        channel: "WHATSAPP",
        direction: "INBOUND",
        fromAddress: targetSub.phone || "Candidate Mobile",
        toAddress: "Agency Scheduler",
        body: `Interview Slot Locked! Candidate confirmed slot ID: ${slotId}`,
        status: "received",
        matched: true,
      });

      return NextResponse.json({
        success: true,
        message: "Interview locked! Calendar invitations dispatched.",
        status: "CONFIRMED",
      });
    }

    if (action === "REQUEST_ALTERNATIVE_SLOTS") {
      // LOCKED RULE: If candidate requests alternative slots, create Recruiter Cockpit Task!
      const timesList = Array.isArray(preferredTimes) ? preferredTimes.join(", ") : preferredTimes || "Candidate provided custom availability.";

      // Flag candidate risk or system note to surface in Recruiter Cockpit Action Queue
      await db
        .update(candidateSubmissions)
        .set({
          riskStatus: "HIGH_RISK",
          riskReason: `Candidate requested alternative interview times: ${timesList}`,
          lastCommunicationAt: new Date(),
        })
        .where(eq(candidateSubmissions.submissionId, submissionId));

      // Log Alert Task Entry
      await db.insert(communicationLog).values({
        agencyId: targetSub.agencyId,
        submissionId,
        candidateId: targetSub.candidateId,
        channel: "WHATSAPP",
        direction: "INBOUND",
        fromAddress: targetSub.phone || "Candidate Mobile",
        toAddress: "Recruiter Cockpit Action Queue",
        body: `ACTION REQUIRED: Candidate ${targetSub.fullName} requested alternative interview times: ${timesList}. Recruiter needs to coordinate with client!`,
        status: "received",
        matched: true,
      });

      return NextResponse.json({
        success: true,
        message: "Alternative slot request submitted. Assigned Recruiter will coordinate with Client HR.",
        status: "ALTERNATIVE_REQUESTED",
      });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to confirm interview slot" },
      { status: 500 }
    );
  }
}
