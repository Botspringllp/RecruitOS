import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, withTenantTx } from '@/db';
import { agencyChannels, candidateRecords, candidateSubmissions, communicationLog } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

// Zod validation for inbound webhooks (payload sent by providers like WABA or SMTP mailer)
const inboundPayloadSchema = z.object({
  channel: z.enum(['whatsapp', 'email', 'WHATSAPP', 'EMAIL'] as const, {
    message: "channel must be 'whatsapp' or 'email'",
  }),
  to: z.string().min(1, { message: "to (receiver address) is required" }),
  from: z.string().min(1, { message: "from (sender address) is required" }),
  body: z.string().min(1, { message: "body text is required" }),
  externalMessageId: z.string().min(1, { message: "externalMessageId is required" }),
});

const NEGATIVE_SENTIMENT_KEYWORDS = [
  "declining",
  "accepted counter offer",
  "not interested",
  "cannot join",
  "withdrawing",
  "reject",
  "decline",
  "opt out"
];

export async function POST(request: Request) {
  try {
    // 1. Validate payload structure
    const json = await request.json();
    const result = inboundPayloadSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid webhook payload format', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { channel, to, from, body, externalMessageId } = result.data;
    const normalizedChannel = channel.toLowerCase();

    // 2. Identify the tenant (agency) using the receiving address/number.
    const channelMapping = await db.query.agencyChannels.findFirst({
      where: and(
        eq(agencyChannels.channel, normalizedChannel),
        eq(agencyChannels.address, to)
      ),
    });

    if (!channelMapping) {
      console.warn(`[Webhook Drop] Inbound message directed to unregistered endpoint: ${to} (${normalizedChannel})`);
      return NextResponse.json({ ok: true, matched: false, reason: 'unregistered_endpoint' });
    }

    const { agencyId } = channelMapping;

    // 3. Process database check and insertion under the RLS context for the identified agency
    const matchResult = await withTenantTx(agencyId, async (tx: any) => {
      // Find candidate matching the sender address
      const matchField = normalizedChannel === 'whatsapp' ? candidateRecords.phone : candidateRecords.email;
      
      const candidate = await tx.query.candidateRecords.findFirst({
        where: eq(matchField, from),
      });

      const candidateId = candidate ? candidate.candidateId : null;
      let submissionId = null;

      // Negative Sentiment Detection Check (Workflow 3 Section 7)
      const lowerBody = body.toLowerCase();
      const detectedKeyword = NEGATIVE_SENTIMENT_KEYWORDS.find(keyword => lowerBody.includes(keyword));
      const isHighRisk = !!detectedKeyword;

      if (candidateId) {
        // Find active submission for this candidate
        const subList = await tx
          .select()
          .from(candidateSubmissions)
          .where(
            and(
              eq(candidateSubmissions.agencyId, agencyId),
              eq(candidateSubmissions.candidateId, candidateId)
            )
          )
          .limit(1);

        if (subList.length > 0) {
          const sub = subList[0];
          submissionId = sub.submissionId;

          // Update submission communication timestamp & risk status if sentiment detected
          await tx
            .update(candidateSubmissions)
            .set({
              lastCommunicationAt: new Date(),
              riskStatus: isHighRisk ? 'HIGH_RISK' : sub.riskStatus,
              riskReason: isHighRisk 
                ? `Negative sentiment detected in inbound ${normalizedChannel.toUpperCase()}: "${detectedKeyword}"` 
                : sub.riskReason,
            })
            .where(eq(candidateSubmissions.submissionId, sub.submissionId));
        }
      }

      // Log the inbound message
      await tx.insert(communicationLog).values({
        agencyId: agencyId,
        submissionId: submissionId,
        candidateId: candidateId,
        channel: normalizedChannel.toUpperCase(),
        direction: 'INBOUND',
        fromAddress: from,
        toAddress: to,
        body: body,
        externalMessageId: externalMessageId,
        status: 'received',
        matched: candidateId !== null,
      });

      return {
        matched: candidateId !== null,
        candidateId,
        submissionId,
        isHighRisk,
        detectedKeyword: detectedKeyword || null,
      };
    });

    return NextResponse.json({ ok: true, ...matchResult }, { status: 200 });
  } catch (error: any) {
    console.error('Inbound webhook failure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
