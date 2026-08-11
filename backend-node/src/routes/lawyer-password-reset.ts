import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { randomBytes, createHash, randomUUID } from 'crypto';
import { query } from '../db.js';
import { config } from '../config.js';
import { hashPassword } from '../platform-auth.js';
import { normalizePhone, phoneDigits, validatePassword } from '../security/validate.js';
import { isTwilioConfigured, startVerification, checkVerification } from '../twilio-verify.js';

export const lawyerPasswordResetRouter = Router();

// Neutral response used whenever we must not reveal whether a phone number
// belongs to a lawyer account (prevents account enumeration).
const NEUTRAL_OTP_RESPONSE = {
  success: true,
  message: 'If this number belongs to a lawyer account, an OTP has been sent.',
};

const requestOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many OTP requests. Try again later.' },
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

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

type EligibleLawyer = {
  user_id: string;
  user_status: string;
  lawyer_id: string;
  match_count: number;
};

/**
 * Looks up a lawyer by the last 10 digits of their phone number.
 * Only returns a result when exactly one active lawyer matches.
 */
async function findVerifiedLawyerByPhone(digits: string): Promise<EligibleLawyer | null> {
  const r = await query<EligibleLawyer>(
    `SELECT u.id AS user_id, u.status AS user_status, l.id AS lawyer_id,
            count(*) OVER () AS match_count
       FROM lawyers l
       JOIN platform_users u ON u.lawyer_id = l.id AND u.role = 'lawyer'
      WHERE right(regexp_replace(l.phone, '\\D', '', 'g'), 10) = $1`,
    [digits],
  );
  if (r.rows.length !== 1) return null; // not found or ambiguous
  const row = r.rows[0];
  if (Number(row.match_count) !== 1) return null; // ambiguous phone
  if (row.user_status !== 'active') return null; // blocked / deleted
  return row;
}

// Step 1: request an OTP for a registered phone number.
lawyerPasswordResetRouter.post('/request-otp', requestOtpLimiter, async (req, res) => {
  try {
    const { phone } = req.body as { phone?: string };
    const e164 = phone ? normalizePhone(phone, config.otpDefaultCountryCode) : null;
    const digits = phone ? phoneDigits(phone) : null;
    if (!e164 || !digits) {
      res.status(400).json({ detail: 'Enter a valid phone number.' });
      return;
    }

    const lawyer = await findVerifiedLawyerByPhone(digits);
    // Do not reveal whether the account exists / is eligible.
    if (!lawyer) {
      res.json(NEUTRAL_OTP_RESPONSE);
      return;
    }

    // Per-phone resend cooldown.
    const existing = await query<{ otp_sent_at: string | null }>(
      'SELECT otp_sent_at FROM lawyer_password_resets WHERE phone_key = $1',
      [digits],
    );
    const lastSent = existing.rows[0]?.otp_sent_at ? new Date(existing.rows[0].otp_sent_at) : null;
    if (lastSent) {
      const elapsed = (Date.now() - lastSent.getTime()) / 1000;
      if (elapsed < config.otpResendCooldownSeconds) {
        res.status(429).json({
          detail: `Please wait ${Math.ceil(config.otpResendCooldownSeconds - elapsed)}s before requesting another OTP.`,
        });
        return;
      }
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
    await query(
      `INSERT INTO lawyer_password_resets
         (id, user_id, lawyer_id, phone, phone_key, otp_sent_at, otp_verified, token_hash, token_used, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), false, NULL, false, $6)
       ON CONFLICT (phone_key) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         lawyer_id = EXCLUDED.lawyer_id,
         phone = EXCLUDED.phone,
         otp_sent_at = NOW(),
         otp_verified = false,
         token_hash = NULL,
         token_used = false,
         expires_at = EXCLUDED.expires_at`,
      [randomUUID(), lawyer.user_id, lawyer.lawyer_id, e164, digits, expiresAt],
    );

    res.json(NEUTRAL_OTP_RESPONSE);
  } catch (e) {
    console.error('request-otp failed', e);
    res.status(500).json({ detail: 'Failed to send OTP.' });
  }
});

// Step 2: verify the OTP and issue a one-time reset token.
lawyerPasswordResetRouter.post('/verify-otp', verifyOtpLimiter, async (req, res) => {
  try {
    const { phone, code } = req.body as { phone?: string; code?: string };
    const e164 = phone ? normalizePhone(phone, config.otpDefaultCountryCode) : null;
    const digits = phone ? phoneDigits(phone) : null;
    const cleanCode = typeof code === 'string' ? code.trim() : '';
    if (!e164 || !digits || !/^\d{4,10}$/.test(cleanCode)) {
      res.status(400).json({ detail: 'Enter the OTP that was sent to your phone.' });
      return;
    }

    const existing = await query<{ id: string; expires_at: string | null }>(
      'SELECT id, expires_at FROM lawyer_password_resets WHERE phone_key = $1',
      [digits],
    );
    const row = existing.rows[0];
    if (!row || (row.expires_at && new Date(row.expires_at).getTime() < Date.now())) {
      res.status(400).json({ detail: 'Invalid or expired OTP. Please request a new one.' });
      return;
    }

    const result = await checkVerification(e164, cleanCode);
    if (!result.ok) {
      res.status(400).json({ detail: 'Invalid or expired OTP. Please try again.' });
      return;
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + config.passwordResetTtlMinutes * 60 * 1000);
    await query(
      `UPDATE lawyer_password_resets
         SET otp_verified = true, token_hash = $1, token_used = false, expires_at = $2
       WHERE id = $3`,
      [tokenHash(token), expiresAt, row.id],
    );

    res.json({ success: true, resetToken: token });
  } catch (e) {
    console.error('verify-otp failed', e);
    res.status(500).json({ detail: 'Failed to verify OTP.' });
  }
});

// Step 3: set a new password using the one-time reset token.
lawyerPasswordResetRouter.post('/set-password', setPasswordLimiter, async (req, res) => {
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
      `SELECT id, user_id FROM lawyer_password_resets
        WHERE token_hash = $1 AND otp_verified = true AND token_used = false
          AND expires_at > NOW()`,
      [tokenHash(resetToken)],
    );
    const row = r.rows[0];
    if (!row) {
      res.status(400).json({ detail: 'Invalid or expired reset session. Please start again.' });
      return;
    }

    const passwordHash = await hashPassword(pwd);
    const updated = await query(
      `UPDATE platform_users SET password_hash = $1 WHERE id = $2 AND role = 'lawyer'`,
      [passwordHash, row.user_id],
    );
    if (updated.rowCount === 0) {
      res.status(400).json({ detail: 'Account no longer available.' });
      return;
    }

    // One-time: consume the reset session so the token cannot be reused.
    await query(
      'UPDATE lawyer_password_resets SET token_used = true, token_hash = NULL WHERE id = $1',
      [row.id],
    );

    res.json({ success: true, message: 'Password updated. You can now sign in.' });
  } catch (e) {
    console.error('set-password failed', e);
    res.status(500).json({ detail: 'Failed to set password.' });
  }
});
