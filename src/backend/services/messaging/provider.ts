export interface OutboundMessage {
  to: string; // phone number (E.164) or email address
  body: string;
}

export interface SendResult {
  externalMessageId: string;
  status: 'sent' | 'failed';
}

export interface InboundMessage {
  from: string;
  to: string;
  body: string;
  externalMessageId: string;
  receivedAt: string;
}

export interface MessagingProvider {
  channel: 'whatsapp' | 'email';
  send(msg: OutboundMessage): Promise<SendResult>;
}

// -----------------------------------------------------------------
// STUB Implementations
// Logs messages to the console and generates a stub ID.
// This allows the database logging, webhook pipelines, and UI
// to run completely end-to-end without real Meta or SMTP credentials.
// -----------------------------------------------------------------

export class MetaWhatsAppProvider implements MessagingProvider {
  channel: 'whatsapp' = 'whatsapp';

  async send(msg: OutboundMessage): Promise<SendResult> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // Fallback to stub logging if keys are missing
    if (!token || !phoneId) {
      console.log(`[MetaWhatsAppProvider - STUB FALLBACK] Sending message to ${msg.to}:`);
      console.log(`>>> ${msg.body}`);
      return {
        externalMessageId: `waba_stub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        status: 'sent',
      };
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: msg.to,
          type: 'text',
          text: {
            body: msg.body,
          },
        }),
      });

      const resJson = await response.json();

      if (!response.ok) {
        console.error('[MetaWhatsAppProvider] Meta Cloud API call failed:', resJson);
        return {
          externalMessageId: 'error_failed_to_send',
          status: 'failed',
        };
      }

      const messageId = resJson.messages?.[0]?.id || `waba_${Date.now()}`;
      console.log(`[MetaWhatsAppProvider] Successfully sent message to ${msg.to}. Meta ID: ${messageId}`);
      return {
        externalMessageId: messageId,
        status: 'sent',
      };
    } catch (error) {
      console.error('[MetaWhatsAppProvider] Error calling Meta endpoint:', error);
      return {
        externalMessageId: 'error_exception',
        status: 'failed',
      };
    }
  }
}

export class StubEmailProvider implements MessagingProvider {
  channel: 'email' = 'email';

  async send(msg: OutboundMessage): Promise<SendResult> {
    console.log(`[STUB Email Provider] Sending email to ${msg.to}:`);
    console.log(`>>> ${msg.body}`);
    return {
      externalMessageId: `smtp_stub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      status: 'sent',
    };
  }
}

// Swap these instances with real ones (e.g. MetaWhatsAppProvider / PostmarkEmailProvider)
// once credentials/tokens are provided by the client.
export const whatsappProvider: MessagingProvider = new MetaWhatsAppProvider();
export const emailProvider: MessagingProvider = new StubEmailProvider();
