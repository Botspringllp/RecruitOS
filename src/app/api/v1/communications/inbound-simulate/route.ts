import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communicationLog, candidateSubmissions, candidateRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

const NEGATIVE_SENTIMENT_KEYWORDS = [
  "declining",
  "accepted counter offer",
  "counter offer",
  "not interested",
  "cannot join",
  "withdrawing",
  "withdraw",
  "rejecting",
  "rejected",
  "another offer",
  "no longer available"
];

export async function POST(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const body = await req.json();
    const { submissionId, candidateId, channel, messageBody } = body;

    if (!messageBody || (!submissionId && !candidateId)) {
      return NextResponse.json({ error: "Inbound message body and candidate/submission are required." }, { status: 400 });
    }

    const { agencyId } = context;
    const now = new Date();

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

    // 1. Check for negative sentiment keywords
    const lowerBody = messageBody.toLowerCase();
    const matchedKeywords = NEGATIVE_SENTIMENT_KEYWORDS.filter(kw => lowerBody.includes(kw));
    const isNegativeSentiment = matchedKeywords.length > 0;

    // 2. If negative sentiment detected, append High Risk tag to Candidate Record (RC-01 / Validation Rule)
    if (isNegativeSentiment && targetCandidateId) {
      const candList = await db
        .select({ tags: candidateRecords.tags })
        .from(candidateRecords)
        .where(eq(candidateRecords.candidateId, targetCandidateId))
        .limit(1);

      if (candList.length > 0) {
        const currentTags = candList[0].tags || [];
        const riskTag = "High Risk: Declining / Counter Offer";
        if (!currentTags.includes(riskTag)) {
          const updatedTags = [...currentTags, riskTag];
          await db
            .update(candidateRecords)
            .set({ tags: updatedTags, updatedAt: now })
            .where(eq(candidateRecords.candidateId, targetCandidateId));
        }
      }
    }

    // 3. Log Inbound message entry in DB
    const [logEntry] = await db
      .insert(communicationLog)
      .values({
        agencyId,
        candidateId: targetCandidateId || null,
        submissionId: submissionId || null,
        channel: channel || "WHATSAPP",
        direction: "INBOUND",
        fromAddress: "Candidate Mobile",
        toAddress: "RecruitOS Inbound",
        body: messageBody,
        status: "received",
        matched: true,
      })
      .returning();

    // 4. Update last_communication_at on Candidate Submissions
    if (submissionId) {
      await db
        .update(candidateSubmissions)
        .set({ lastCommunicationAt: now })
        .where(eq(candidateSubmissions.submissionId, submissionId));
    }

    return NextResponse.json({
      success: true,
      message: "Inbound communication logged successfully!",
      isNegativeSentiment,
      matchedKeywords,
      logEntry,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log inbound communication" }, { status: 500 });
  }
}
