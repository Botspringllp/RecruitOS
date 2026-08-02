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

export class StubWhatsAppProvider implements MessagingProvider {
  channel: 'whatsapp' = 'whatsapp';

  async send(msg: OutboundMessage): Promise<SendResult> {
    console.log(`[STUB WhatsApp Provider] Sending message to ${msg.to}:`);
    console.log(`>>> ${msg.body}`);
    return {
      externalMessageId: `waba_stub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      status: 'sent',
    };
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

// Swap these instances with real ones (e.g. TwilioWhatsAppProvider / SendGridEmailProvider)
// once credentials/tokens are provided by the client.
export const whatsappProvider: MessagingProvider = new StubWhatsAppProvider();
export const emailProvider: MessagingProvider = new StubEmailProvider();
