import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface SendOtpResult {
  success: boolean;
  messageId?: string;
  method: 'resend' | 'gmail-api' | 'gmail-smtp' | 'custom-smtp' | 'console-logger';
  error?: string;
}

/**
 * Sends a 6-digit verification OTP to the specified user's email.
 * Supports:
 * 1. Gmail REST API (via OAuth Access Token or Refresh Token)
 * 2. Gmail SMTP (via GMAIL_USER & GMAIL_APP_PASSWORD)
 * 3. Custom SMTP (via SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 * 4. Fallback console logger (when credentials are not yet configured)
 */
export async function sendOtpEmail(toEmail: string, otp: string, userName?: string): Promise<SendOtpResult> {
  const recipientName = userName || toEmail.split('@')[0];
  const subject = `Your PrepPilot Verification Code: ${otp}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #4f46e5; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; text-align: center; }
    .greeting { font-size: 15px; text-align: left; margin-bottom: 20px; color: #334155; }
    .instructions { font-size: 14px; text-align: left; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
    .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .otp-code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; margin: 0; }
    .validity { font-size: 12px; color: #94a3b8; margin-top: 8px; }
    .footer { background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PrepPilot AI</h1>
      <p>Intelligent Career Copilot for University Candidates</p>
    </div>
    <div class="content">
      <div class="greeting">Hello <strong>${recipientName}</strong>,</div>
      <div class="instructions">
        Thank you for signing in to PrepPilot. Please use the following 6-digit verification code to confirm your email address and access your career intelligence dashboard:
      </div>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="validity">This code is valid for 10 minutes. Do not share it with anyone.</div>
      </div>
      <div class="instructions" style="margin-bottom: 0;">
        If you did not request this verification code, you can safely disregard this email.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} PrepPilot AI. Built for high-impact campus placements & internships.
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `Hello ${recipientName},\n\nYour PrepPilot verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nPrepPilot AI Team`;

  // 0. Try Resend first (fastest to set up, most reliable for a demo)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        // While your Resend domain is unverified, you MUST send from this
        // address — Resend only lets unverified accounts use their own
        // sandbox sender. Once you verify a real domain, change this to
        // something like 'PrepPilot <hello@yourdomain.com>'.
        from: 'PrepPilot <onboarding@resend.dev>',
        to: toEmail,
        subject,
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        console.warn(`[PrepPilot Email] Resend returned an error:`, error);
      } else {
        console.log(`[PrepPilot Email] Successfully sent OTP via Resend to ${toEmail}. Message ID: ${data?.id}`);
        return { success: true, messageId: data?.id, method: 'resend' };
      }
    } catch (resendErr: any) {
      console.warn(`[PrepPilot Email] Resend dispatch attempt failed:`, resendErr.message);
    }
  }

  // 1. Try Gmail REST API (if user set GMAIL_ACCESS_TOKEN or refresh token)
  const gmailAccessToken = process.env.GMAIL_ACCESS_TOKEN;
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (gmailAccessToken || (gmailRefreshToken && googleClientId && googleClientSecret)) {
    try {
      let activeToken = gmailAccessToken;
      if (!activeToken && gmailRefreshToken) {
        // Exchange refresh token for fresh access token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: googleClientId,
            client_secret: googleClientSecret,
            refresh_token: gmailRefreshToken,
            grant_type: 'refresh_token'
          })
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          activeToken = tokenData.access_token;
        }
      }

      if (activeToken) {
        const fromEmail = process.env.GMAIL_USER || 'me';
        const rawMessage = [
          `To: ${toEmail}`,
          `Subject: ${subject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=utf-8',
          '',
          htmlContent
        ].join('\r\n');

        const encodedMessage = Buffer.from(rawMessage)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: encodedMessage })
        });

        if (sendRes.ok) {
          const resData = await sendRes.json();
          console.log(`[PrepPilot Email] Successfully sent OTP via Gmail REST API to ${toEmail}. Message ID: ${resData.id}`);
          return { success: true, messageId: resData.id, method: 'gmail-api' };
        } else {
          const errText = await sendRes.text();
          console.warn(`[PrepPilot Email] Gmail REST API returned ${sendRes.status}: ${errText}`);
        }
      }
    } catch (apiErr: any) {
      console.warn(`[PrepPilot Email] Gmail REST API dispatch attempt failed:`, apiErr.message);
    }
  }

  // 2. Try Gmail SMTP via Nodemailer (GMAIL_USER & GMAIL_APP_PASSWORD)
  const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD || process.env.EMAIL_PASS;

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass.replace(/\s+/g, '') // Google App Passwords often have spaces, strip them safely
        }
      });

      const info = await transporter.sendMail({
        from: `"PrepPilot AI" <${gmailUser}>`,
        to: toEmail,
        subject: subject,
        text: textContent,
        html: htmlContent
      });

      console.log(`[PrepPilot Email] Successfully sent OTP via Gmail SMTP to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId, method: 'gmail-smtp' };
    } catch (smtpErr: any) {
      console.warn(`[PrepPilot Email] Gmail SMTP dispatch attempt failed:`, smtpErr.message);
    }
  }

  // 3. Try Generic / Custom SMTP
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: `"PrepPilot AI" <${smtpUser}>`,
        to: toEmail,
        subject: subject,
        text: textContent,
        html: htmlContent
      });

      console.log(`[PrepPilot Email] Successfully sent OTP via Custom SMTP to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId, method: 'custom-smtp' };
    } catch (customSmtpErr: any) {
      console.warn(`[PrepPilot Email] Custom SMTP dispatch attempt failed:`, customSmtpErr.message);
    }
  }

  // 4. Default / Setup Mode
  // If no email credentials have been configured yet in .env, log to terminal only.
  console.log(`\n=============================================================`);
  console.log(`[PrepPilot OTP Mail Service]`);
  console.log(`Target Recipient: ${toEmail}`);
  console.log(`Generated OTP:    ${otp}`);
  console.log(`Status: Ready for Gmail API / App Password.`);
  console.log(`To send live emails to your inbox, set GMAIL_USER and GMAIL_APP_PASSWORD (or Gmail API tokens) in .env.`);
  console.log(`=============================================================\n`);

  return {
    success: true,
    method: 'console-logger'
  };
}
