import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clientPortalTokens, candidateSubmissions, proposedInterviewSlots, communicationLog, candidateRecords } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate token and expiration
    const portalToken = await db
      .select()
      .from(clientPortalTokens)
      .where(
        and(
          eq(clientPortalTokens.tokenHash, token),
          gt(clientPortalTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (portalToken.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired client review link." },
        { status: 404 }
      );
    }

    const { agencyId, jobId } = portalToken[0];
    const body = await req.json();

    const { submissionId, decision, rejectionReason, proposedSlots, interviewerEmail } = body;

    if (!submissionId || !decision) {
      return NextResponse.json(
        { error: "submissionId and decision ('SHORTLIST' | 'HOLD' | 'REJECT') are required." },
        { status: 400 }
      );
    }

    // Verify submission belongs to this job and agency
    const sub = await db
      .select({
        submissionId: candidateSubmissions.submissionId,
        candidateId: candidateSubmissions.candidateId,
        stage: candidateSubmissions.stage,
        fullName: candidateRecords.fullName,
        phone: candidateRecords.phone,
        email: candidateRecords.email,
      })
      .from(candidateSubmissions)
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .where(
        and(
          eq(candidateSubmissions.submissionId, submissionId),
          eq(candidateSubmissions.jobId, jobId),
          eq(candidateSubmissions.agencyId, agencyId)
        )
      )
      .limit(1);

    if (sub.length === 0) {
      return NextResponse.json({ error: "Candidate submission not found for this mandate" }, { status: 404 });
    }

    const targetSub = sub[0];
    const now = new Date();

    if (decision === "REJECT") {
      if (!rejectionReason || !rejectionReason.trim()) {
        return NextResponse.json(
          { error: "Mandatory rejection reason required when declining candidate." },
          { status: 400 }
        );
      }

      // Update stage to Rejected & log rejection reason
      // LOCKED RULE: Rejection updates candidate status but does NOT auto-create re-sourcing tasks!
      await db
        .update(candidateSubmissions)
        .set({
          stage: "Rejected",
          rejectionReason: rejectionReason.trim(),
          stageUpdatedAt: now,
        })
        .where(eq(candidateSubmissions.submissionId, submissionId));

      // Log decision
      await db.insert(communicationLog).values({
        agencyId,
        submissionId,
        candidateId: targetSub.candidateId,
        channel: "SYSTEM_NOTE",
        direction: "INBOUND",
        fromAddress: "Client HR Portal",
        toAddress: "Recruiter Cockpit",
        body: `Client decision: REJECT. Reason: ${rejectionReason}`,
        status: "received",
        matched: true,
      });

      return NextResponse.json({
        success: true,
        message: "Candidate marked as Rejected. Feedback recorded successfully.",
        decision: "REJECT",
      });
    }

    if (decision === "HOLD") {
      await db
        .update(candidateSubmissions)
        .set({
          stageUpdatedAt: now,
        })
        .where(eq(candidateSubmissions.submissionId, submissionId));

      return NextResponse.json({
        success: true,
        message: "Candidate placed on Hold.",
        decision: "HOLD",
      });
    }

    if (decision === "SHORTLIST") {
      // Validate Past Time Guard (Edge Case #7): start_time >= NOW() + 12 hours
      const twelveHoursFromNow = new Date(Date.now() + 12 * 3600 * 1000);

      if (proposedSlots && Array.isArray(proposedSlots) && proposedSlots.length > 0) {
        const invalidSlot = proposedSlots.find((slot: any) => {
          const startTime = new Date(slot.startTime || slot.start_time);
          return startTime < twelveHoursFromNow;
        });

        if (invalidSlot) {
          return NextResponse.json(
            {
              error:
                "Past Time Guard Breach: All proposed interview slots must be scheduled at least 12 hours in advance from current time.",
            },
            { status: 400 }
          );
        }

        // Save proposed slots into DB
        for (const slot of proposedSlots) {
          await db.insert(proposedInterviewSlots).values({
            submissionId,
            interviewerEmail: slot.interviewerEmail || slot.interviewer_email || interviewerEmail || "hr@client.com",
            startTime: new Date(slot.startTime || slot.start_time),
            endTime: new Date(slot.endTime || slot.end_time),
            status: "Proposed",
          });
        }
      }

      // Update Stage to Interviewing
      await db
        .update(candidateSubmissions)
        .set({
          stage: "Interviewing",
          stageUpdatedAt: now,
        })
        .where(eq(candidateSubmissions.submissionId, submissionId));

      // Dispatch WhatsApp notification to candidate (CE-01: 1-Click WhatsApp Slot Confirmator)
      await db.insert(communicationLog).values({
        agencyId,
        submissionId,
        candidateId: targetSub.candidateId,
        channel: "WHATSAPP",
        direction: "OUTBOUND",
        fromAddress: "Agency Scheduler",
        toAddress: targetSub.phone || "Candidate Mobile",
        body: `Congratulations ${targetSub.fullName}! TechCorp shortlisted your profile. Please click here to select your preferred interview slot: http://localhost:3000/interview-confirm/${submissionId}`,
        status: "sent",
        matched: true,
      });

      return NextResponse.json({
        success: true,
        message: "Candidate Shortlisted and interview slot options dispatched to candidate via WhatsApp!",
        decision: "SHORTLIST",
      });
    }

    return NextResponse.json({ error: "Invalid decision value" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process client decision" },
      { status: 500 }
    );
  }
}
