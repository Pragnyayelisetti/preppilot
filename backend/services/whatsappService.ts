/**
 * Automated WhatsApp sending via Twilio's WhatsApp API.
 *
 * Uses plain `fetch` against Twilio's REST API directly (Basic Auth),
 * so no extra npm package is required.
 *
 * SETUP (Twilio WhatsApp Sandbox — free, no business verification needed):
 *   1. Sign up at twilio.com and open Messaging > Try it out > Send a WhatsApp message.
 *   2. From your own WhatsApp, send the shown "join <your-sandbox-code>" phrase
 *      to the Twilio sandbox number (+1 415 523 8886 by default).
 *   3. Copy your Account SID and Auth Token from the Twilio Console dashboard.
 *   4. Set these env vars on your backend:
 *        TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *        TWILIO_AUTH_TOKEN=your_auth_token
 *        TWILIO_WHATSAPP_FROM=+14155238886   (the sandbox number, no "whatsapp:" prefix)
 *
 * IMPORTANT SANDBOX LIMITATION: in sandbox mode, EVERY recipient number must
 * also send that same "join <code>" message to the Twilio number once,
 * before Twilio will deliver messages to them. This is a Twilio restriction,
 * not something fixable in code — it's the trade-off for not needing Meta
 * Business verification. For sending to arbitrary numbers with no opt-in
 * step, you'd need to apply for the official WhatsApp Business Platform
 * (Meta Cloud API) instead, which requires business verification and
 * typically takes a few days.
 *
 * Without these env vars set, sendWhatsAppMessage() returns
 * { success: false, method: 'not-configured' } and the caller should fall
 * back to the existing wa.me click-to-chat link.
 */

interface SendWhatsAppResult {
  success: boolean;
  method: 'twilio' | 'not-configured';
  sid?: string;
  error?: string;
}

export async function sendWhatsAppMessage(toPhoneE164: string, message: string): Promise<SendWhatsAppResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, method: 'not-configured' };
  }

  // Twilio needs E.164 format with a leading "+" — accept numbers that
  // already have it, and add it if the caller passed digits only.
  const cleanTo = toPhoneE164.startsWith('+') ? toPhoneE164 : `+${toPhoneE164.replace(/\D/g, '')}`;
  const cleanFrom = fromNumber.startsWith('+') ? fromNumber : `+${fromNumber.replace(/\D/g, '')}`;

  try {
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const body = new URLSearchParams({
      To: `whatsapp:${cleanTo}`,
      From: `whatsapp:${cleanFrom}`,
      Body: message,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    );

    const data = await res.json() as { sid?: string; message?: string };

    if (!res.ok) {
      console.warn('[WhatsApp/Twilio] Send failed:', data);
      return { success: false, method: 'twilio', error: data.message || `Twilio returned ${res.status}` };
    }

    console.log(`[WhatsApp/Twilio] Message sent to ${cleanTo}, SID: ${data.sid}`);
    return { success: true, method: 'twilio', sid: data.sid };
  } catch (err: any) {
    console.warn('[WhatsApp/Twilio] Send threw an error:', err.message);
    return { success: false, method: 'twilio', error: err.message };
  }
}