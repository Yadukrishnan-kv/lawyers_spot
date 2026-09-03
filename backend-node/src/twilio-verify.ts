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

type TwilioErrorDetails = { code?: number; message?: string; text: string };

/**
 * Extracts Twilio's { code, message, more_info } error fields from a failed
 * response body so the real reason (e.g. 21608 = unverified number in trial
 * mode) ends up in the server logs instead of a generic message.
 */
async function describeTwilioError(res: Response): Promise<TwilioErrorDetails> {
  const raw = await res.text().catch(() => '');
  try {
    const parsed = JSON.parse(raw) as { code?: number; message?: string; more_info?: string };
    const text = `code=${parsed.code ?? 'unknown'} message="${parsed.message ?? 'n/a'}" more_info=${parsed.more_info ?? 'n/a'}`;
    return { code: parsed.code, message: parsed.message, text };
  } catch {
    return { text: raw || 'unreadable' };
  }
}

export type TwilioResult = { ok: boolean; status?: string; error?: string; twilioCode?: number };

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
      const details = await describeTwilioError(res);
      console.error(`Twilio start verification failed (HTTP ${res.status}): ${details.text}`);
      return { ok: false, error: 'twilio_error', twilioCode: details.code };
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
      const details = await describeTwilioError(res);
      console.error(`Twilio verification check failed (HTTP ${res.status}): ${details.text}`);
      return { ok: false, error: 'twilio_error', twilioCode: details.code };
    }
    const data = (await res.json()) as { status?: string };
    return { ok: data.status === 'approved', status: data.status };
  } catch {
    console.error('Twilio verification check request failed');
    return { ok: false, error: 'twilio_unavailable' };
  }
}
