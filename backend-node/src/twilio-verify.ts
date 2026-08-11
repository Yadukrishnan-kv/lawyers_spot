import { config } from './config.js';

/**
 * Thin wrapper around the Twilio Verify REST API. Uses global fetch (Node 18+)
 * so no extra dependency is required. OTP codes are generated and validated by
 * Twilio — they are never generated, stored, or logged by this service.
 */

export function isTwilioConfigured(): boolean {
  return Boolean(
    config.twilioAccountSid && config.twilioAuthToken && config.twilioVerifyServiceSid,
  );
}

function authHeader(): string {
  const token = Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64');
  return `Basic ${token}`;
}

function verifyBaseUrl(): string {
  return `https://verify.twilio.com/v2/Services/${config.twilioVerifyServiceSid}`;
}

export type TwilioResult = { ok: boolean; status?: string; error?: string };

/**
 * Starts an SMS verification for the given E.164 phone number.
 * Never logs the phone number or any Twilio secrets.
 */
export async function startVerification(phoneE164: string): Promise<TwilioResult> {
  if (!isTwilioConfigured()) return { ok: false, error: 'not_configured' };
  try {
    const body = new URLSearchParams({ To: phoneE164, Channel: 'sms' });
    const res = await fetch(`${verifyBaseUrl()}/Verifications`, {
      method: 'POST',
      headers: {
        Authorization: authHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      // Do not surface Twilio's raw response (may echo the number); log status only.
      console.error(`Twilio start verification failed with status ${res.status}`);
      return { ok: false, error: 'twilio_error' };
    }
    const data = (await res.json()) as { status?: string };
    return { ok: true, status: data.status };
  } catch {
    console.error('Twilio start verification request failed');
    return { ok: false, error: 'twilio_unavailable' };
  }
}

/**
 * Checks a verification code. Returns ok=true only when Twilio reports the
 * verification as "approved".
 */
export async function checkVerification(phoneE164: string, code: string): Promise<TwilioResult> {
  if (!isTwilioConfigured()) return { ok: false, error: 'not_configured' };
  try {
    const body = new URLSearchParams({ To: phoneE164, Code: code });
    const res = await fetch(`${verifyBaseUrl()}/VerificationCheck`, {
      method: 'POST',
      headers: {
        Authorization: authHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 404) {
      // Verification not found / already consumed / expired on Twilio's side.
      return { ok: false, status: 'expired', error: 'invalid_or_expired' };
    }
    if (!res.ok) {
      console.error(`Twilio verification check failed with status ${res.status}`);
      return { ok: false, error: 'twilio_error' };
    }
    const data = (await res.json()) as { status?: string };
    return { ok: data.status === 'approved', status: data.status };
  } catch {
    console.error('Twilio verification check request failed');
    return { ok: false, error: 'twilio_unavailable' };
  }
}
