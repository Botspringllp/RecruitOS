import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communicationLog, candidateSubmissions, candidateRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function POST(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const body = await req.json();
    const { submissionId, candidateId, channel, messageBody, templateKey } = body;

    if (!messageBody || (!submissionId && !candidateId)) {
      return NextResponse.json({ error: "Message body and target candidate/submission are required." }, { status: 400 });
    }

    const { agencyId, userId } = context;
    const now = new Date();

    // 1. If submissionId is provided, get candidate details
    let targetCandidateId = candidateId;
    if (submissionId && !targetCandidateId) {
      const subList = await db
        .select({ candidateId: candidateSubmissions.candidateId })
        .from(candidateSubmissions)
        .where(eq(candidateSubmissions.submissionId, submissionId))
        .limit(1);

      if (subList.length > 0) {
        targetCandidateId = subList[0].candidateId;
      }
    }

    // 2. Fetch recipient contact info
    let toAddress = "";
    if (targetCandidateId) {
      const candList = await db
        .select({ phone: candidateRecords.phone, email: candidateRecords.email })
        .from(candidateRecords)
        .where(eq(candidateRecords.candidateId, targetCandidateId))
        .limit(1);

      if (candList.length > 0) {
        toAddress = channel === "WHATSAPP" || channel === "whatsapp" 
          ? (candList[0].phone || "") 
          : (candList[0].email || "");
      }
    }

    // 3. Log outbound communication entry in DB (RC-01)
    const [logEntry] = await db
      .insert(communicationLog)
      .values({
        agencyId,
        candidateId: targetCandidateId || null,
        submissionId: submissionId || null,
        sentByUserId: userId || null,
        channel: channel || "WHATSAPP",
        direction: "OUTBOUND",
        fromAddress: "RecruitOS Dispatcher",
        toAddress,
        body: messageBody,
        status: "sent",
        matched: true,
      })
      .returning();

    // 4. Update last_communication_at on Candidate Submissions
    if (submissionId) {
      await db
        .update(candidateSubmissions)
        .set({ lastCommunicationAt: now })
        .where(eq(candidateSubmissions.submissionId, submissionId));
    } else if (targetCandidateId) {
      await db
        .update(candidateSubmissions)
        .set({ lastCommunicationAt: now })
        .where(eq(candidateSubmissions.candidateId, targetCandidateId));
    }

    return NextResponse.json({
      success: true,
      message: `Message dispatched successfully via ${channel || "WhatsApp"}!`,
      logEntry,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to dispatch communication" }, { status: 500 });
  }
}
