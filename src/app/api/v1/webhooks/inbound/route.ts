import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, withTenantTx } from '@/lib/db';
import { agencyChannels, candidateRecords, communicationLog } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

// Zod validation for inbound webhooks (payload sent by providers like WABA or SMTP mailer)
const inboundPayloadSchema = z.object({
  channel: z.enum(['whatsapp', 'email'] as const, {
    message: "channel must be 'whatsapp' or 'email'",
  }),
  to: z.string().min(1, { message: "to (receiver address) is required" }),
  from: z.string().min(1, { message: "from (sender address) is required" }),
  body: z.string().min(1, { message: "body text is required" }),
  externalMessageId: z.string().min(1, { message: "externalMessageId is required" }),
});

export async function POST(request: Request) {
  try {
    // TODO: Verify provider signature here (e.g. Meta header validation or Mail webhook keys)
    // before trusting the payload in production.

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

    // 2. Identify the tenant (agency) using the receiving address/number.
    // (This lookup runs without RLS context because we do not have a user session,
    // and we need this to find out WHICH tenant context we should set).
    const channelMapping = await db.query.agencyChannels.findFirst({
      where: and(
        eq(agencyChannels.channel, channel),
        eq(agencyChannels.address, to)
      ),
    });

    if (!channelMapping) {
      console.warn(`[Webhook Drop] Inbound message directed to unregistered endpoint: ${to} (${channel})`);
      return NextResponse.json({ ok: true, matched: false, reason: 'unregistered_endpoint' });
    }

    const { agencyId } = channelMapping;

    // 3. Process database check and insertion under the RLS context for the identified agency
    const matchResult = await withTenantTx(agencyId, async (tx) => {
      // Find candidate matching the sender address (phone for WhatsApp, email for Email)
      const matchField = channel === 'whatsapp' ? candidateRecords.phone : candidateRecords.email;
      
      const candidate = await tx.query.candidateRecords.findFirst({
        where: eq(matchField, from),
      });

      const candidateId = candidate ? candidate.candidateId : null;

      // Log the inbound message.
      // If candidateId is null, matched is false, saving it as an "Unlinked Lead" in the Cockpit.
      await tx.insert(communicationLog).values({
        agencyId: agencyId,
        candidateId: candidateId,
        channel: channel,
        direction: 'inbound',
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
      };
    });

    return NextResponse.json({ ok: true, ...matchResult }, { status: 200 });
  } catch (error: any) {
    console.error('Inbound webhook failure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
