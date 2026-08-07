import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { noticePeriodPulseLogs, candidateSubmissions, communicationLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, pulseToken, touchpointDay, responseStatus, candidateComments } = body;

    if ((!submissionId && !pulseToken) || !responseStatus) {
      return NextResponse.json(
        { error: "submissionId or pulseToken, and responseStatus ('Responded_Safe' | 'High_Risk_Counter_Offer' | 'Unresponded') are required." },
        { status: 400 }
      );
    }

    let targetSubId = submissionId;

    if (pulseToken) {
      const existingPulse = await db
        .select()
        .from(noticePeriodPulseLogs)
        .where(eq(noticePeriodPulseLogs.pulseToken, pulseToken))
        .limit(1);

      if (existingPulse.length > 0) {
        targetSubId = existingPulse[0].submissionId;
      }
    }

    const sub = await db
      .select()
      .from(candidateSubmissions)
      .where(eq(candidateSubmissions.submissionId, targetSubId))
      .limit(1);

    if (sub.length === 0) {
      return NextResponse.json({ error: "Candidate submission not found" }, { status: 404 });
    }

    // Insert pulse log entry
    const [pulseLog] = await db
      .insert(noticePeriodPulseLogs)
      .values({
        submissionId: targetSubId,
        touchpointDay: touchpointDay || 15,
        responseStatus,
        unrespondedAttempts: responseStatus === "Unresponded" ? 1 : 0,
        pulseToken: pulseToken || null,
      })
      .returning();

    // If candidate reported counter-offer or delayed resignation, flag high risk
    if (responseStatus === "High_Risk_Counter_Offer") {
      await db
        .update(candidateSubmissions)
        .set({
          riskStatus: "HIGH_RISK",
          riskReason: `Notice Period Counter-Offer Alert on Day ${touchpointDay || 15}! Candidate reported counter-offer / retention pressure.`,
        })
        .where(eq(candidateSubmissions.submissionId, targetSubId));

      await db.insert(communicationLog).values({
        agencyId: sub[0].agencyId,
        submissionId: targetSubId,
        candidateId: sub[0].candidateId,
        channel: "WHATSAPP",
        direction: "INBOUND",
        fromAddress: "Candidate Pulse Check",
        toAddress: "Recruiter Retention Radar",
        body: `HIGH RISK ALERT (Day ${touchpointDay || 15}): Candidate reported counter-offer / retention pressure from current employer! Comments: ${candidateComments || "None"}`,
        status: "received",
        matched: true,
      });
    } else if (responseStatus === "Responded_Safe") {
      await db
        .update(candidateSubmissions)
        .set({
          riskStatus: "NORMAL",
          riskReason: null,
        })
        .where(eq(candidateSubmissions.submissionId, targetSubId));

      await db.insert(communicationLog).values({
        agencyId: sub[0].agencyId,
        submissionId: targetSubId,
        candidateId: sub[0].candidateId,
        channel: "WHATSAPP",
        direction: "INBOUND",
        fromAddress: "Candidate Pulse Check",
        toAddress: "Recruiter Retention Radar",
        body: `Notice Period Pulse Check Day ${touchpointDay || 15}: Resignation & Handover proceeding smoothly (Responded Safe).`,
        status: "received",
        matched: true,
      });
    }

    return NextResponse.json({
      success: true,
      pulseId: pulseLog.pulseId,
      responseStatus,
      message: `Notice period pulse check response recorded as '${responseStatus}'.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process candidate notice pulse" },
      { status: 500 }
    );
  }
}
