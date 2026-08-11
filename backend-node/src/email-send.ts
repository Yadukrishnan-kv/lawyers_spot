import { config } from './config.js';

/**
 * Thin wrapper around the Resend REST API for transactional email. Uses global
 * fetch (Node 18+) so no extra dependency is required. Mirrors the style of
 * twilio-verify.ts. Never logs recipient addresses or OTP codes.
 */

export function isEmailConfigured(): boolean {
  return Boolean(config.resendApiKey && config.emailFrom);
}

export type EmailResult = { ok: boolean; error?: string };

export async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  if (!isEmailConfigured()) return { ok: false, error: 'not_configured' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: config.emailFrom, to: [to], subject, html }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      // Do not surface the raw response (may echo the address); log status only.
      console.error(`Email send failed with status ${res.status}`);
      return { ok: false, error: 'email_error' };
    }
    return { ok: true };
  } catch {
    console.error('Email send request failed');
    return { ok: false, error: 'email_unavailable' };
  }
}

/** Builds the OTP email body for a client password reset. */
export function passwordResetOtpEmail(code: string): { subject: string; html: string } {
  const ttl = config.passwordResetTtlMinutes;
  return {
    subject: 'Your LawyerSpot password reset code',
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
        <h2 style="margin:0 0 12px">Reset your password</h2>
        <p style="margin:0 0 16px;color:#475569">Use the verification code below to reset your LawyerSpot password. This code expires in ${ttl} minutes.</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f1f5f9;border-radius:12px;padding:16px;text-align:center">${code}</div>
        <p style="margin:16px 0 0;color:#94a3b8;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };
}
