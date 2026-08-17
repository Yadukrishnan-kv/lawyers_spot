import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { randomInt, randomUUID, createHash } from 'crypto';
import { loadCms, saveCms } from '../cms.js';
import {
  clearUserCookie,
  findUserByEmail,
  findUserByPhone,
  findUserById,
  hashPassword,
  setUserCookie,
  verifyPassword,
  requireUser,
} from '../platform-auth.js';
import { query } from '../db.js';
import { config } from '../config.js';
import {
  normalizeEmail,
  normalizePhone,
  phoneDigits,
  sanitizeText,
  validatePassword,
} from '../security/validate.js';
import { slugifyName } from '../lawyer-slug.js';
import { isTwilioConfigured, startVerification, checkVerification } from '../twilio-verify.js';
import { isEmailConfigured, sendEmail, signupOtpEmail } from '../email-send.js';

export const authRouter = Router();

const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many requests. Try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many requests. Try again later.' },
});

const MAX_EMAIL_OTP_ATTEMPTS = 5;

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

type PendingSignup = {
  id: string;
  role: string;
  name: string;
  email: string;
  password_hash: string;
  phone: string;
  phone_key: string;
  bar_id: string | null;
  city_slug: string | null;
  practice: string | null;
  phone_verified: boolean;
  email_otp_hash: string | null;
  email_otp_attempts: number;
};

async function findPendingSignup(role: string, pendingId: string): Promise<PendingSignup | null> {
  const r = await query<PendingSignup>(
    `SELECT id, role, name, email, password_hash, phone, phone_key, bar_id, city_slug, practice,
            phone_verified, email_otp_hash, email_otp_attempts
       FROM signup_verifications
      WHERE id = $1 AND role = $2 AND expires_at > NOW()`,
    [pendingId, role],
  );
  return r.rows[0] ?? null;
}

async function resendCooldownRemaining(column: 'phone_otp_sent_at' | 'email_otp_sent_at', pendingId: string): Promise<number> {
  const r = await query<{ sent_at: string | null }>(
    `SELECT ${column} AS sent_at FROM signup_verifications WHERE id = $1`,
    [pendingId],
  );
  const lastSent = r.rows[0]?.sent_at ? new Date(r.rows[0].sent_at) : null;
  if (!lastSent) return 0;
  const elapsed = (Date.now() - lastSent.getTime()) / 1000;
  const remaining = config.otpResendCooldownSeconds - elapsed;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}

// Step 1 (client): validate the form, stage the signup, and send a phone OTP.
authRouter.post('/signup', sensitiveLimiter, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
    };
    const normalized = email ? normalizeEmail(email) : null;
    const pwd = password ? validatePassword(password) : null;
    const cleanName = name ? sanitizeText(name, 120) : '';
    if (!cleanName || !normalized || !pwd) {
      res.status(400).json({ detail: 'Invalid name, email, or password (min 6 characters)' });
      return;
    }
    const digits = phone ? phoneDigits(phone) : null;
    const e164 = phone ? normalizePhone(phone, config.otpDefaultCountryCode) : null;
    if (!digits || !e164) {
      res.status(400).json({ detail: 'Enter a valid phone number (at least 10 digits).' });
      return;
    }
    const existing = await findUserByEmail(normalized);
    if (existing) {
      res.status(409).json({ detail: 'Unable to create account with this email' });
      return;
    }
    // Phone must be unique so it can be used to sign in / reset the password.
    const phoneOwner = await findUserByPhone(digits);
    if (phoneOwner) {
      res.status(409).json({ detail: 'Unable to create account with this phone number' });
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

    await query('DELETE FROM signup_verifications WHERE expires_at <= NOW()');
    const expiresAt = new Date(Date.now() + config.passwordResetTtlMinutes * 60 * 1000);
    const id = randomUUID();
    await query(
      `INSERT INTO signup_verifications
         (id, role, name, email, password_hash, phone, phone_key, phone_verified, phone_otp_sent_at, expires_at)
       VALUES ($1, 'client', $2, $3, $4, $5, $6, false, NOW(), $7)
       ON CONFLICT (role, lower(email)) DO UPDATE SET
         id = EXCLUDED.id,
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         phone = EXCLUDED.phone,
         phone_key = EXCLUDED.phone_key,
         phone_verified = false,
         phone_otp_sent_at = NOW(),
         expires_at = EXCLUDED.expires_at`,
      [id, cleanName, normalized, await hashPassword(pwd), e164, digits, expiresAt],
    );
    const row = await query<{ id: string }>(
      `SELECT id FROM signup_verifications WHERE role = 'client' AND lower(email) = $1`,
      [normalized],
    );
    res.json({ success: true, pendingId: row.rows[0].id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Signup failed' });
  }
});

// Step 2 (client): verify the phone OTP and create the account.
authRouter.post('/signup/verify-phone', otpLimiter, async (req, res) => {
  try {
    const { pendingId, code } = req.body as { pendingId?: string; code?: string };
    const cleanCode = typeof code === 'string' ? code.trim() : '';
    if (!pendingId || !/^\d{4,10}$/.test(cleanCode)) {
      res.status(400).json({ detail: 'Enter the OTP that was sent to your phone.' });
      return;
    }
    const pending = await findPendingSignup('client', pendingId);
    if (!pending) {
      res.status(400).json({ detail: 'Invalid or expired session. Please start again.' });
      return;
    }
    const result = await checkVerification(pending.phone, cleanCode);
    if (!result.ok) {
      res.status(400).json({ detail: 'Invalid or expired OTP. Please try again.' });
      return;
    }

    const existing = await findUserByEmail(pending.email);
    if (existing) {
      res.status(409).json({ detail: 'Unable to create account with this email' });
      return;
    }
    const phoneOwner = await findUserByPhone(pending.phone_key);
    if (phoneOwner) {
      res.status(409).json({ detail: 'Unable to create account with this phone number' });
      return;
    }

    const id = `user-${Date.now()}`;
    await query(
      `INSERT INTO platform_users (id, email, password_hash, name, role, phone, status, phone_verified)
       VALUES ($1,$2,$3,$4,'client',$5,'active', true)`,
      [id, pending.email, pending.password_hash, pending.name, pending.phone],
    );
    await query('DELETE FROM signup_verifications WHERE id = $1', [pending.id]);
    setUserCookie(res, id, 'client');
    res.json({ success: true, role: 'client', userId: id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to verify OTP.' });
  }
});

// Resend the phone OTP for a pending client signup.
authRouter.post('/signup/resend-phone', otpLimiter, async (req, res) => {
  try {
    const { pendingId } = req.body as { pendingId?: string };
    if (!pendingId) {
      res.status(400).json({ detail: 'Invalid session. Please start again.' });
      return;
    }
    const pending = await findPendingSignup('client', pendingId);
    if (!pending) {
      res.status(400).json({ detail: 'Invalid or expired session. Please start again.' });
      return;
    }
    const wait = await resendCooldownRemaining('phone_otp_sent_at', pendingId);
    if (wait > 0) {
      res.status(429).json({ detail: `Please wait ${wait}s before requesting another code.` });
      return;
    }
    if (!isTwilioConfigured()) {
      res.status(503).json({ detail: 'OTP service is not configured. Please contact support.' });
      return;
    }
    const result = await startVerification(pending.phone);
    if (!result.ok) {
      res.status(502).json({ detail: 'Unable to send OTP right now. Please try again later.' });
      return;
    }
    await query('UPDATE signup_verifications SET phone_otp_sent_at = NOW() WHERE id = $1', [pendingId]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to resend OTP.' });
  }
});

// Step 1 (lawyer): validate the form, stage the signup, and send a phone OTP.
authRouter.post('/lawyer-signup', sensitiveLimiter, async (req, res) => {
  try {
    const { name, email, password, phone, practice, barId, citySlug } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      practice?: string;
      barId?: string;
      citySlug?: string;
    };
    const normalized = email ? normalizeEmail(email) : null;
    const pwd = password ? validatePassword(password) : null;
    const cleanName = name ? sanitizeText(name, 120) : '';
    const cleanPractice = practice ? sanitizeText(practice, 64) : '';
    const digits = phone ? phoneDigits(phone) : null;
    const e164 = phone ? normalizePhone(phone, config.otpDefaultCountryCode) : null;
    if (!cleanName || !normalized || !pwd || !cleanPractice || !digits || !e164) {
      res.status(400).json({ detail: 'Invalid or missing required fields' });
      return;
    }
    const existing = await findUserByEmail(normalized);
    if (existing) {
      res.status(409).json({ detail: 'Unable to create account with this email' });
      return;
    }
    const phoneOwner = await findUserByPhone(digits);
    if (phoneOwner) {
      res.status(409).json({ detail: 'Unable to create account with this phone number' });
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

    await query('DELETE FROM signup_verifications WHERE expires_at <= NOW()');
    const expiresAt = new Date(Date.now() + config.passwordResetTtlMinutes * 60 * 1000);
    const id = randomUUID();
    const cleanBarId = barId ? sanitizeText(barId, 64) : null;
    const safeCity = citySlug ? sanitizeText(citySlug, 128) : null;
    await query(
      `INSERT INTO signup_verifications
         (id, role, name, email, password_hash, phone, phone_key, bar_id, city_slug, practice,
          phone_verified, phone_otp_sent_at, expires_at)
       VALUES ($1, 'lawyer', $2, $3, $4, $5, $6, $7, $8, $9, false, NOW(), $10)
       ON CONFLICT (role, lower(email)) DO UPDATE SET
         id = EXCLUDED.id,
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         phone = EXCLUDED.phone,
         phone_key = EXCLUDED.phone_key,
         bar_id = EXCLUDED.bar_id,
         city_slug = EXCLUDED.city_slug,
         practice = EXCLUDED.practice,
         phone_verified = false,
         email_otp_hash = NULL,
         email_otp_attempts = 0,
         phone_otp_sent_at = NOW(),
         expires_at = EXCLUDED.expires_at`,
      [id, cleanName, normalized, await hashPassword(pwd), e164, digits, cleanBarId, safeCity, cleanPractice, expiresAt],
    );
    const row = await query<{ id: string }>(
      `SELECT id FROM signup_verifications WHERE role = 'lawyer' AND lower(email) = $1`,
      [normalized],
    );
    res.json({ success: true, pendingId: row.rows[0].id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Lawyer signup failed' });
  }
});

// Step 2 (lawyer): verify the phone OTP, then send an email OTP.
authRouter.post('/lawyer-signup/verify-phone', otpLimiter, async (req, res) => {
  try {
    const { pendingId, code } = req.body as { pendingId?: string; code?: string };
    const cleanCode = typeof code === 'string' ? code.trim() : '';
    if (!pendingId || !/^\d{4,10}$/.test(cleanCode)) {
      res.status(400).json({ detail: 'Enter the OTP that was sent to your phone.' });
      return;
    }
    const pending = await findPendingSignup('lawyer', pendingId);
    if (!pending) {
      res.status(400).json({ detail: 'Invalid or expired session. Please start again.' });
      return;
    }
    const result = await checkVerification(pending.phone, cleanCode);
    if (!result.ok) {
      res.status(400).json({ detail: 'Invalid or expired OTP. Please try again.' });
      return;
    }

    if (!isEmailConfigured()) {
      res.status(503).json({ detail: 'Email service is not configured. Please contact support.' });
      return;
    }
    const emailCode = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const { subject, html } = signupOtpEmail(emailCode);
    const sent = await sendEmail(pending.email, subject, html);
    if (!sent.ok) {
      res.status(502).json({ detail: 'Unable to send the email code right now. Please try again later.' });
      return;
    }
    await query(
      `UPDATE signup_verifications
          SET phone_verified = true, email_otp_hash = $1, email_otp_attempts = 0, email_otp_sent_at = NOW()
        WHERE id = $2`,
      [sha256(emailCode), pending.id],
    );
    res.json({ success: true, stage: 'email' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to verify OTP.' });
  }
});

// Resend the phone OTP for a pending lawyer signup.
authRouter.post('/lawyer-signup/resend-phone', otpLimiter, async (req, res) => {
  try {
    const { pendingId } = req.body as { pendingId?: string };
    if (!pendingId) {
      res.status(400).json({ detail: 'Invalid session. Please start again.' });
      return;
    }
    const pending = await findPendingSignup('lawyer', pendingId);
    if (!pending) {
      res.status(400).json({ detail: 'Invalid or expired session. Please start again.' });
      return;
    }
    const wait = await resendCooldownRemaining('phone_otp_sent_at', pendingId);
    if (wait > 0) {
      res.status(429).json({ detail: `Please wait ${wait}s before requesting another code.` });
      return;
    }
    if (!isTwilioConfigured()) {
      res.status(503).json({ detail: 'OTP service is not configured. Please contact support.' });
      return;
    }
    const result = await startVerification(pending.phone);
    if (!result.ok) {
      res.status(502).json({ detail: 'Unable to send OTP right now. Please try again later.' });
      return;
    }
    await query('UPDATE signup_verifications SET phone_otp_sent_at = NOW() WHERE id = $1', [pendingId]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to resend OTP.' });
  }
});

// Step 3 (lawyer): verify the email OTP and create the account.
authRouter.post('/lawyer-signup/verify-email', otpLimiter, async (req, res) => {
  try {
    const { pendingId, code } = req.body as { pendingId?: string; code?: string };
    const cleanCode = typeof code === 'string' ? code.trim() : '';
    if (!pendingId || !/^\d{4,10}$/.test(cleanCode)) {
      res.status(400).json({ detail: 'Enter the verification code that was sent to your email.' });
      return;
    }
    const pending = await findPendingSignup('lawyer', pendingId);
    if (!pending || !pending.phone_verified) {
      res.status(400).json({ detail: 'Invalid or expired session. Please start again.' });
      return;
    }
    if (pending.email_otp_attempts >= MAX_EMAIL_OTP_ATTEMPTS) {
      res.status(429).json({ detail: 'Too many incorrect attempts. Please request a new code.' });
      return;
    }
    if (!pending.email_otp_hash || sha256(cleanCode) !== pending.email_otp_hash) {
      await query('UPDATE signup_verifications SET email_otp_attempts = email_otp_attempts + 1 WHERE id = $1', [
        pending.id,
      ]);
      res.status(400).json({ detail: 'Invalid or expired code. Please try again.' });
      return;
    }

    const existing = await findUserByEmail(pending.email);
    if (existing) {
      res.status(409).json({ detail: 'Unable to create account with this email' });
      return;
    }
    const phoneOwner = await findUserByPhone(pending.phone_key);
    if (phoneOwner) {
      res.status(409).json({ detail: 'Unable to create account with this phone number' });
      return;
    }

    const cms = await loadCms();
    const safeCity =
      pending.city_slug && cms.cities.some((c) => c.slug === pending.city_slug)
        ? pending.city_slug
        : cms.cities[0]?.slug;
    const lawyerId = `lawyer-${Date.now()}`;
    const slug = slugifyName(pending.name);
    const city = cms.cities.find((c) => c.slug === safeCity);
    const newLawyer = {
      id: lawyerId,
      slug,
      name: pending.name,
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      rating: 4.5,
      reviews: 0,
      experience: 1,
      fee: 2000,
      currency: 'INR',
      location: city?.name ?? 'India',
      citySlug: safeCity,
      practice: pending.practice ?? '',
      specialization: pending.practice ? [pending.practice] : [],
      online: true,
      verified: false,
      email: pending.email,
      emailVerified: true,
      phone: pending.phone,
      phoneVerified: true,
      bio: `Bar enrollment: ${pending.bar_id ?? 'pending'}. Profile created via lawyer signup.`,
      createdAt: new Date().toISOString(),
    };
    cms.lawyers.push(newLawyer);
    await saveCms(cms);

    const userId = `lawyer-user-${Date.now()}`;
    await query(
      `INSERT INTO platform_users (id, email, password_hash, name, role, lawyer_id, phone, status, phone_verified)
       VALUES ($1,$2,$3,$4,'lawyer',$5,$6,'active', true)`,
      [userId, pending.email, pending.password_hash, pending.name, lawyerId, pending.phone],
    );
    await query('DELETE FROM signup_verifications WHERE id = $1', [pending.id]);
    setUserCookie(res, userId, 'lawyer');
    res.json({ success: true, role: 'lawyer', userId, lawyerId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Lawyer signup failed' });
  }
});

// Resend the email OTP for a pending lawyer signup (phone must already be verified).
authRouter.post('/lawyer-signup/resend-email', otpLimiter, async (req, res) => {
  try {
    const { pendingId } = req.body as { pendingId?: string };
    if (!pendingId) {
      res.status(400).json({ detail: 'Invalid session. Please start again.' });
      return;
    }
    const pending = await findPendingSignup('lawyer', pendingId);
    if (!pending || !pending.phone_verified) {
      res.status(400).json({ detail: 'Invalid or expired session. Please start again.' });
      return;
    }
    const wait = await resendCooldownRemaining('email_otp_sent_at', pendingId);
    if (wait > 0) {
      res.status(429).json({ detail: `Please wait ${wait}s before requesting another code.` });
      return;
    }
    if (!isEmailConfigured()) {
      res.status(503).json({ detail: 'Email service is not configured. Please contact support.' });
      return;
    }
    const emailCode = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const { subject, html } = signupOtpEmail(emailCode);
    const sent = await sendEmail(pending.email, subject, html);
    if (!sent.ok) {
      res.status(502).json({ detail: 'Unable to send the email code right now. Please try again later.' });
      return;
    }
    await query(
      `UPDATE signup_verifications
          SET email_otp_hash = $1, email_otp_attempts = 0, email_otp_sent_at = NOW()
        WHERE id = $2`,
      [sha256(emailCode), pending.id],
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to resend code.' });
  }
});

authRouter.post('/login', sensitiveLimiter, async (req, res) => {
  try {
    const { email, identifier, password, role } = req.body as {
      email?: string;
      identifier?: string;
      password?: string;
      role?: string;
    };
    // Accept either an explicit `identifier` or the legacy `email` field, and
    // treat it as an email address or a phone number.
    const rawIdentifier = (identifier ?? email ?? '').trim();
    if (!rawIdentifier || !password) {
      res.status(400).json({ detail: 'Email or phone number and password required' });
      return;
    }
    let user: Awaited<ReturnType<typeof findUserByEmail>> | null = null;
    if (rawIdentifier.includes('@')) {
      const normalized = normalizeEmail(rawIdentifier);
      if (normalized) user = await findUserByEmail(normalized);
    } else {
      const digits = phoneDigits(rawIdentifier);
      if (digits) user = await findUserByPhone(digits);
    }
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      res.status(401).json({ detail: 'Invalid credentials' });
      return;
    }
    if (role && user.role !== role) {
      res.status(401).json({ detail: 'Invalid email or password' });
      return;
    }
    if (user.status !== 'active') {
      res.status(403).json({ detail: 'Account not active' });
      return;
    }
    setUserCookie(res, user.id, user.role);
    res.json({
      success: true,
      role: user.role,
      userId: user.id,
      lawyerId: user.lawyer_id,
      name: user.name,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Login failed' });
  }
});

authRouter.post('/logout', (_req, res) => {
  clearUserCookie(res);
  res.json({ success: true });
});

authRouter.get('/me', requireUser(), async (req, res) => {
  const { userId } = (req as typeof req & { user: { userId: string } }).user;
  const user = await findUserById(userId);
  if (!user) {
    res.status(404).json({ detail: 'User not found' });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    lawyerId: user.lawyer_id,
  });
});
