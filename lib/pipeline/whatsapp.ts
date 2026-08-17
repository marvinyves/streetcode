import twilio from "twilio";

const SANDBOX_FROM = "whatsapp:+14155238886";

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

  if (!accountSid || !apiKeySid || !apiKeySecret) {
    throw new Error(
      "TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, and TWILIO_API_KEY_SECRET must all be set.",
    );
  }

  return twilio(apiKeySid, apiKeySecret, { accountSid });
}

function getRecipients(): string[] {
  const raw = process.env.WHATSAPP_RECIPIENTS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
}

export type WhatsAppSendResult = {
  to: string;
  sid?: string;
  error?: string;
};

/**
 * Sends the daily brief summary to every configured recipient over the
 * Twilio WhatsApp Sandbox. Each recipient must have joined the sandbox
 * (texted the join code) at least once, or their send will fail with a
 * Twilio error — that's expected and reported per-recipient, not fatal to
 * the batch.
 */
export async function sendWhatsAppBrief(message: string): Promise<WhatsAppSendResult[]> {
  const recipients = getRecipients();
  if (recipients.length === 0) {
    console.warn("[whatsapp] WHATSAPP_RECIPIENTS not set, skipping send.");
    return [];
  }

  const client = getClient();
  const from = process.env.TWILIO_WHATSAPP_FROM || SANDBOX_FROM;
  const contentSid = process.env.TWILIO_CONTENT_SID;

  const results = await Promise.allSettled(
    recipients.map(async (to) => {
      const msg = await client.messages.create({
        from: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
        to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
        // Some Twilio accounts require an approved Content Template for
        // every outbound WhatsApp message, even to a joined sandbox number
        // (error: "ContentSid Required"). When TWILIO_CONTENT_SID is set,
        // send via that template with the full message as its single
        // variable; otherwise send as plain free text.
        ...(contentSid
          ? {
              contentSid,
              contentVariables: JSON.stringify({ "1": message }),
            }
          : { body: message }),
      });
      return { to, sid: msg.sid };
    }),
  );

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { to: recipients[i], error: (r.reason as Error)?.message ?? String(r.reason) },
  );
}
