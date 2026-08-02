import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getTenantContext } from '@/lib/auth/tenantContext';
import { withTenantTx } from '@/lib/db';
import { candidateRecords, communicationLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { whatsappProvider, emailProvider } from '@/lib/messaging/provider';

// Zod schema for validating the outbound message payload
const sendPayloadSchema = z.object({
  candidateId: z.string().uuid({ message: 'candidateId must be a valid UUID' }),
  channel: z.enum(['whatsapp', 'email'] as const, {
    message: "channel must be either 'whatsapp' or 'email'",
  }),
  body: z.string().min(1, { message: 'body cannot be empty' }),
});

export async function POST(request: Request) {
  try {
    // 1. Extract tenant context from auth token or dev headers
    let tenant;
    try {
      tenant = await getTenantContext();
    } catch (authError: any) {
      return NextResponse.json({ error: authError.message || 'Unauthorized' }, { status: 401 });
    }

    const { agencyId } = tenant;

    // 2. Parse and validate payload
    const json = await request.json();
    const result = sendPayloadSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { candidateId, channel, body } = result.data;

    // 3. Retrieve candidate record under Postgres RLS context
    const dbResult = await withTenantTx(agencyId, async (tx) => {
      // Find candidate
      const candidate = await tx.query.candidateRecords.findFirst({
        where: eq(candidateRecords.candidateId, candidateId),
      });

      if (!candidate) {
        return { error: 'Candidate not found', status: 404 };
      }

      // Check if candidate has contact info for the requested channel
      const recipient = channel === 'whatsapp' ? candidate.phone : candidate.email;
      if (!recipient) {
        return {
          error: `Candidate does not have a registered ${channel} address on file`,
          status: 422,
        };
      }

      // Send the message using the provider
      const provider = channel === 'whatsapp' ? whatsappProvider : emailProvider;
      const sendResponse = await provider.send({ to: recipient, body });

      // Log the outbound communication history
      const logInsert = await tx
        .insert(communicationLog)
        .values({
          agencyId: agencyId,
          candidateId: candidateId,
          channel: channel,
          direction: 'outbound',
          fromAddress: 'agency_inbox', // Placeholder for the sending address/number
          toAddress: recipient,
          body: body,
          externalMessageId: sendResponse.externalMessageId,
          status: sendResponse.status,
          matched: true,
        })
        .returning({
          messageId: communicationLog.messageId,
          createdAt: communicationLog.createdAt,
        });

      return {
        data: {
          messageId: logInsert[0].messageId,
          status: sendResponse.status,
          createdAt: logInsert[0].createdAt,
        },
        status: 201,
      };
    });

    if ('error' in dbResult) {
      return NextResponse.json({ error: dbResult.error }, { status: dbResult.status });
    }

    return NextResponse.json(dbResult.data, { status: dbResult.status });
  } catch (error: any) {
    console.error('Outbound message route failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
