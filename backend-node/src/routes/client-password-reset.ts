import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { randomBytes, randomInt, createHash, randomUUID } from 'crypto';
import { query } from '../db.js';
import { config } from '../config.js';
import { hashPassword } from '../platform-auth.js';
import { normalizeEmail, normalizePhone, phoneDigits, validatePassword } from '../security/validate.js';
import { isTwilioConfigured, startVerification, checkVerification } from '../twilio-verify.js';
import { isEmailConfigured, sendEmail, passwordResetOtpEmail } from '../email-send.js';

export const clientPasswordResetRouter = Router();

// Neutral response used whenever we must not reveal whether an email/phone
// belongs to a client account (prevents account enumeration).
const NEUTRAL_OTP_RESPONSE = {
  success: true,
  message: 'If an account matches, a verification code has been sent.',
};

const MAX_EMAIL_OTP_ATTEMPTS = 5;

const requestOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many code requests. Try again later.' },
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many attempts. Try again later.' },
});

const setPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many attempts. Try again later.' },
});

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

type EligibleClient = { user_id: string; email: string | null; phone: string | null };

/** Finds an active client by exact (normalized) email. */
async function findClientByEmail(email: string): Promise<EligibleClient | null> {
  const r = await query<EligibleClient>(
    `SELECT id AS user_id, email, phone FROM platform_users
      WHERE role = 'client' AND status = 'active' AND lower(email) = $1
      LIMIT 1`,
    [email],
  );
  return r.rows[0] ?? null;
}

/**
 * Finds an active client by the last 10 digits of their phone number.
 * Only returns a result when exactly one active client matches.
 */
async function findClientByPhone(digits: string): Promise<EligibleClient | null> {
  const r = await query<EligibleClient & { match_count: string }>(
    `SELECT id AS user_id, email, phone, count(*) OVER () AS match_count
       FROM platform_users
      WHERE role = 'client' AND status = 'active' AND phone IS NOT NULL
        AND right(regexp_replace(phone, '\\D', '', 'g'), 10) = $1`,
    [digits],
  );
  if (r.rows.length !== 1) return null; // not found or ambiguous
  if (Number(r.rows[0].match_count) !== 1) return null;
  return r.rows[0];
}

/** Upserts the single active reset session for a client (keyed on user_id). */
async function upsertResetSession(params: {
  userId: string;
  channel: 'email' | 'phone';
  email: string | null;
  phone: string | null;
  phoneKey: string | null;
  otpHash: string | null;
  expiresAt: Date;
}): Promise<void> {
  await query(
    `INSERT INTO client_password_resets
       (id, user_id, channel, email, phone, phone_key, otp_hash, otp_attempts,
        otp_sent_at, otp_verified, token_hash, token_used, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 0, NOW(), false, NULL, false, $8)
     ON CONFLICT (user_id) DO UPDATE SET
       channel = EXCLUDED.channel,
       email = EXCLUDED.email,
       phone = EXCLUDED.phone,
       phone_key = EXCLUDED.phone_key,
       otp_hash = EXCLUDED.otp_hash,
       otp_attempts = 0,
       otp_sent_at = NOW(),
       otp_verified = false,
       token_hash = NULL,
       token_used = false,
       expires_at = EXCLUDED.expires_at`,
    [
      randomUUID(),
      params.userId,
      params.channel,
      params.email,
      params.phone,
      params.phoneKey,
      params.otpHash,
      params.expiresAt,
    ],
  );
}

/** Enforces the per-account resend cooldown. Returns remaining seconds, or 0. */
async function resendCooldownRemaining(userId: string): Promise<number> {
  const existing = await query<{ otp_sent_at: string | null }>(
    'SELECT otp_sent_at FROM client_password_resets WHERE user_id = $1',
    [userId],
  );
  const lastSent = existing.rows[0]?.otp_sent_at ? new Date(existing.rows[0].otp_sent_at) : null;
  if (!lastSent) return 0;
  const elapsed = (Date.now() - lastSent.getTime()) / 1000;
  const remaining = config.otpResendCooldownSeconds - elapsed;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}

// Step 1: request a verification code via email or phone.
clientPasswordResetRouter.post('/request-otp', requestOtpLimiter, async (req, res) => {
  try {
    const { channel, email, phone } = req.body as {
      channel?: string;
      email?: string;
      phone?: string;
    };

    if (channel === 'email') {
      const normalized = email ? normalizeEmail(email) : null;
      if (!normalized) {
        res.status(400).json({ detail: 'Enter a valid email address.' });
        return;
      }
      if (!isEmailConfigured()) {
        res.status(503).json({ detail: 'Email service is not configured. Please contact support.' });
        return;
      }
      const client = await findClientByEmail(normalized);
      if (!client) {
        res.json(NEUTRAL_OTP_RESPONSE);
        return;
      }
      const wait = await resendCooldownRemaining(client.user_id);
      if (wait > 0) {
        res.status(429).json({ detail: `Please wait ${wait}s before requesting another code.` });
        return;
      }
      const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
      const expiresAt = new Date(Date.now() + config.passwordResetTtlMinutes * 60 * 1000);
      const { subject, html } = passwordResetOtpEmail(code);
      const sent = await sendEmail(normalized, subject, html);
      if (!sent.ok) {
        res.status(502).json({ detail: 'Unable to send the code right now. Please try again later.' });
        return;
      }
      await upsertResetSession({
        userId: client.user_id,
        channel: 'email',
        email: normalized,
        phone: null,
        phoneKey: null,
        otpHash: sha256(code),
        expiresAt,
      });
      res.json(NEUTRAL_OTP_RESPONSE);
      return;
    }

    if (channel === 'phone') {
      const e164 = phone ? normalizePhone(phone, config.otpDefaultCountryCode) : null;
      const digits = phone ? phoneDigits(phone) : null;
      if (!e164 || !digits) {
        res.status(400).json({ detail: 'Enter a valid phone number.' });
        return;
      }
      const client = await findClientByPhone(digits);
      if (!client) {
        res.json(NEUTRAL_OTP_RESPONSE);
        return;
      }
      const wait = await resendCooldownRemaining(client.user_id);
      if (wait > 0) {
        res.status(429).json({ detail: `Please wait ${wait}s before requesting another code.` });
        return;
      }
      if (!isTwilioConfigured()) {
        res.status(503).json({ detail: 'OTP service is not configured. Please contact support.' });
        return;
      }
      const result = await startVerification(e164);
      if (!result.ok) {
        res.status(502).json({ detail: 'Unable to send OTP right now. Please try again later.' });
        return;
      }
      const expiresAt = new Date(Date.now() + config.passwordResetTtlMinutes * 60 * 1000);
      await upsertResetSession({
        userId: client.user_id,
        channel: 'phone',
        email: null,
        phone: e164,
        phoneKey: digits,
        otpHash: null,
        expiresAt,
      });
      res.json(NEUTRAL_OTP_RESPONSE);
      return;
    }

    res.status(400).json({ detail: 'Choose a valid verification method.' });
  } catch (e) {
    console.error('client request-otp failed', e);
    res.status(500).json({ detail: 'Failed to send verification code.' });
  }
});

// Step 2: verify the code and issue a one-time reset token.
clientPasswordResetRouter.post('/verify-otp', verifyOtpLimiter, async (req, res) => {
  try {
    const { channel, email, phone, code } = req.body as {
      channel?: string;
      email?: string;
      phone?: string;
      code?: string;
    };
    const cleanCode = typeof code === 'string' ? code.trim() : '';
    if (!/^\d{4,10}$/.test(cleanCode)) {
      res.status(400).json({ detail: 'Enter the verification code that was sent to you.' });
      return;
    }

    let session:
      | { id: string; user_id: string; otp_hash: string | null; otp_attempts: number }
      | undefined;

    if (channel === 'email') {
      const normalized = email ? normalizeEmail(email) : null;
      if (!normalized) {
        res.status(400).json({ detail: 'Enter a valid email address.' });
        return;
      }
      const r = await query<{ id: string; user_id: string; otp_hash: string | null; otp_attempts: number }>(
        `SELECT id, user_id, otp_hash, otp_attempts FROM client_password_resets
          WHERE channel = 'email' AND lower(email) = $1 AND expires_at > NOW()`,
        [normalized],
      );
      session = r.rows[0];
    } else if (channel === 'phone') {
      const e164 = phone ? normalizePhone(phone, config.otpDefaultCountryCode) : null;
      const digits = phone ? phoneDigits(phone) : null;
      if (!e164 || !digits) {
        res.status(400).json({ detail: 'Enter a valid phone number.' });
        return;
      }
      const r = await query<{ id: string; user_id: string; otp_hash: string | null; otp_attempts: number }>(
        `SELECT id, user_id, otp_hash, otp_attempts FROM client_password_resets
          WHERE channel = 'phone' AND phone_key = $1 AND expires_at > NOW()`,
        [digits],
      );
      session = r.rows[0];
      if (session) {
        const result = await checkVerification(e164, cleanCode);
        if (!result.ok) {
          res.status(400).json({ detail: 'Invalid or expired OTP. Please try again.' });
          return;
        }
      }
    } else {
      res.status(400).json({ detail: 'Choose a valid verification method.' });
      return;
    }

    if (!session) {
      res.status(400).json({ detail: 'Invalid or expired code. Please request a new one.' });
      return;
    }

    if (channel === 'email') {
      if (session.otp_attempts >= MAX_EMAIL_OTP_ATTEMPTS) {
        res.status(429).json({ detail: 'Too many incorrect attempts. Please request a new code.' });
        return;
      }
      if (!session.otp_hash || sha256(cleanCode) !== session.otp_hash) {
        await query(
          'UPDATE client_password_resets SET otp_attempts = otp_attempts + 1 WHERE id = $1',
          [session.id],
        );
        res.status(400).json({ detail: 'Invalid or expired code. Please try again.' });
        return;
      }
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + config.passwordResetTtlMinutes * 60 * 1000);
    await query(
      `UPDATE client_password_resets
         SET otp_verified = true, otp_hash = NULL, token_hash = $1, token_used = false, expires_at = $2
       WHERE id = $3`,
      [sha256(token), expiresAt, session.id],
    );

    res.json({ success: true, resetToken: token });
  } catch (e) {
    console.error('client verify-otp failed', e);
    res.status(500).json({ detail: 'Failed to verify code.' });
  }
});

// Step 3: set a new password using the one-time reset token.
clientPasswordResetRouter.post('/set-password', setPasswordLimiter, async (req, res) => {
  try {
    const { resetToken, password, confirmPassword } = req.body as {
      resetToken?: string;
      password?: string;
      confirmPassword?: string;
    };
    if (!resetToken || typeof resetToken !== 'string') {
      res.status(400).json({ detail: 'Missing reset token. Please restart the process.' });
      return;
    }
    const pwd = password ? validatePassword(password) : null;
    if (!pwd) {
      res.status(400).json({ detail: 'Password must be between 6 and 128 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ detail: 'Passwords do not match.' });
      return;
    }

    const r = await query<{ id: string; user_id: string }>(
      `SELECT id, user_id FROM client_password_resets
        WHERE token_hash = $1 AND otp_verified = true AND token_used = false
          AND expires_at > NOW()`,
      [sha256(resetToken)],
    );
    const row = r.rows[0];
    if (!row) {
      res.status(400).json({ detail: 'Invalid or expired reset session. Please start again.' });
      return;
    }

    const passwordHash = await hashPassword(pwd);
    const updated = await query(
      `UPDATE platform_users SET password_hash = $1 WHERE id = $2 AND role = 'client'`,
      [passwordHash, row.user_id],
    );
    if (updated.rowCount === 0) {
      res.status(400).json({ detail: 'Account no longer available.' });
      return;
    }

    // One-time: consume the reset session so the token cannot be reused.
    await query(
      'UPDATE client_password_resets SET token_used = true, token_hash = NULL WHERE id = $1',
      [row.id],
    );

    res.json({ success: true, message: 'Password updated. You can now sign in.' });
  } catch (e) {
    console.error('client set-password failed', e);
    res.status(500).json({ detail: 'Failed to set password.' });
  }
});
