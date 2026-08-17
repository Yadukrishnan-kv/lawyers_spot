import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { randomInt, createHash } from 'crypto';
import { loadCms } from '../cms.js';
import { findUserById, requireUser } from '../platform-auth.js';
import { query } from '../db.js';
import { config } from '../config.js';
import { normalizePhone } from '../security/validate.js';
import { isTwilioConfigured, startVerification, checkVerification } from '../twilio-verify.js';
import { isEmailConfigured, sendEmail, signupOtpEmail } from '../email-send.js';
export const lawyerVerifyRouter = Router();
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { detail: 'Too many requests. Try again later.' },
});
const MAX_EMAIL_OTP_ATTEMPTS = 5;
function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}
async function resolveLawyer(userId) {
    const user = await findUserById(userId);
    if (!user || user.role !== 'lawyer' || !user.lawyer_id)
        return null;
    const cms = await loadCms();
    const lawyer = cms.lawyers.find((l) => l.id === user.lawyer_id);
    if (!lawyer)
        return null;
    return lawyer;
}
async function cooldownRemaining(column, lawyerId) {
    const r = await query(`SELECT ${column} AS sent_at FROM lawyer_self_verifications WHERE lawyer_id = $1`, [lawyerId]);
    const lastSent = r.rows[0]?.sent_at ? new Date(r.rows[0].sent_at) : null;
    if (!lastSent)
        return 0;
    const elapsed = (Date.now() - lastSent.getTime()) / 1000;
    const remaining = config.otpResendCooldownSeconds - elapsed;
    return remaining > 0 ? Math.ceil(remaining) : 0;
}
// Request an email OTP for the logged-in lawyer to self-verify their email.
lawyerVerifyRouter.post('/verify-email/request-otp', otpLimiter, requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const lawyer = await resolveLawyer(userId);
        if (!lawyer) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        if (lawyer.emailVerified) {
            res.status(400).json({ detail: 'Email is already verified.' });
            return;
        }
        if (!lawyer.email) {
            res.status(400).json({ detail: 'No email on file for this account.' });
            return;
        }
        const wait = await cooldownRemaining('email_otp_sent_at', lawyer.id);
        if (wait > 0) {
            res.status(429).json({ detail: `Please wait ${wait}s before requesting another code.` });
            return;
        }
        if (!isEmailConfigured()) {
            res.status(503).json({ detail: 'Email service is not configured. Please contact support.' });
            return;
        }
        const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
        const { subject, html } = signupOtpEmail(code);
        const sent = await sendEmail(lawyer.email, subject, html);
        if (!sent.ok) {
            res.status(502).json({ detail: 'Unable to send the code right now. Please try again later.' });
            return;
        }
        const expiresAt = new Date(Date.now() + config.passwordResetTtlMinutes * 60 * 1000);
        await query(`INSERT INTO lawyer_self_verifications (lawyer_id, email_otp_hash, email_otp_attempts, email_otp_sent_at, email_expires_at, updated_at)
       VALUES ($1, $2, 0, NOW(), $3, NOW())
       ON CONFLICT (lawyer_id) DO UPDATE SET
         email_otp_hash = EXCLUDED.email_otp_hash,
         email_otp_attempts = 0,
         email_otp_sent_at = NOW(),
         email_expires_at = EXCLUDED.email_expires_at,
         updated_at = NOW()`, [lawyer.id, sha256(code), expiresAt]);
        res.json({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to send verification code.' });
    }
});
// Confirm the email OTP and mark the lawyer's email as verified.
lawyerVerifyRouter.post('/verify-email/confirm', otpLimiter, requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const { code } = req.body;
        const cleanCode = typeof code === 'string' ? code.trim() : '';
        if (!/^\d{4,10}$/.test(cleanCode)) {
            res.status(400).json({ detail: 'Enter the verification code that was sent to you.' });
            return;
        }
        const lawyer = await resolveLawyer(userId);
        if (!lawyer) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        const r = await query('SELECT email_otp_hash, email_otp_attempts, email_expires_at FROM lawyer_self_verifications WHERE lawyer_id = $1', [lawyer.id]);
        const row = r.rows[0];
        if (!row || !row.email_expires_at || new Date(row.email_expires_at).getTime() < Date.now()) {
            res.status(400).json({ detail: 'Invalid or expired code. Please request a new one.' });
            return;
        }
        if (row.email_otp_attempts >= MAX_EMAIL_OTP_ATTEMPTS) {
            res.status(429).json({ detail: 'Too many incorrect attempts. Please request a new code.' });
            return;
        }
        if (!row.email_otp_hash || sha256(cleanCode) !== row.email_otp_hash) {
            await query('UPDATE lawyer_self_verifications SET email_otp_attempts = email_otp_attempts + 1 WHERE lawyer_id = $1', [lawyer.id]);
            res.status(400).json({ detail: 'Invalid or expired code. Please try again.' });
            return;
        }
        await query('UPDATE lawyers SET email_verified = true WHERE id = $1', [lawyer.id]);
        await query('UPDATE lawyer_self_verifications SET email_otp_hash = NULL, email_otp_attempts = 0, email_expires_at = NULL WHERE lawyer_id = $1', [lawyer.id]);
        res.json({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to verify code.' });
    }
});
// Request a phone OTP for the logged-in lawyer to self-verify their phone.
lawyerVerifyRouter.post('/verify-phone/request-otp', otpLimiter, requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const lawyer = await resolveLawyer(userId);
        if (!lawyer) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        if (lawyer.phoneVerified) {
            res.status(400).json({ detail: 'Phone number is already verified.' });
            return;
        }
        const e164 = lawyer.phone ? normalizePhone(lawyer.phone, config.otpDefaultCountryCode) : null;
        if (!e164) {
            res.status(400).json({ detail: 'No phone number on file for this account.' });
            return;
        }
        const wait = await cooldownRemaining('phone_otp_sent_at', lawyer.id);
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
        await query(`INSERT INTO lawyer_self_verifications (lawyer_id, phone_otp_sent_at, updated_at)
       VALUES ($1, NOW(), NOW())
       ON CONFLICT (lawyer_id) DO UPDATE SET phone_otp_sent_at = NOW(), updated_at = NOW()`, [lawyer.id]);
        res.json({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to send OTP.' });
    }
});
// Confirm the phone OTP and mark the lawyer's phone as verified.
lawyerVerifyRouter.post('/verify-phone/confirm', otpLimiter, requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const { code } = req.body;
        const cleanCode = typeof code === 'string' ? code.trim() : '';
        if (!/^\d{4,10}$/.test(cleanCode)) {
            res.status(400).json({ detail: 'Enter the OTP that was sent to your phone.' });
            return;
        }
        const lawyer = await resolveLawyer(userId);
        if (!lawyer) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        const e164 = lawyer.phone ? normalizePhone(lawyer.phone, config.otpDefaultCountryCode) : null;
        if (!e164) {
            res.status(400).json({ detail: 'No phone number on file for this account.' });
            return;
        }
        const result = await checkVerification(e164, cleanCode);
        if (!result.ok) {
            res.status(400).json({ detail: 'Invalid or expired OTP. Please try again.' });
            return;
        }
        await query('UPDATE lawyers SET phone_verified = true WHERE id = $1', [lawyer.id]);
        res.json({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to verify OTP.' });
    }
});
