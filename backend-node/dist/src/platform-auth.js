import bcrypt from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { config } from './config.js';
import { query } from './db.js';
export const USER_COOKIE = 'lawyerspot_user_session';
export function createUserSessionToken(userId, role) {
    const exp = Date.now() + config.sessionDays * 24 * 60 * 60 * 1000;
    const payload = `${userId}|${role}|${exp}`;
    const sig = createHmac('sha256', config.adminSessionSecret).update(payload).digest('hex');
    return Buffer.from(`${payload}|${sig}`).toString('base64url');
}
export function verifyUserSessionToken(token) {
    if (!token)
        return null;
    try {
        const decoded = Buffer.from(token, 'base64url').toString('utf-8');
        const parts = decoded.split('|');
        if (parts.length !== 4)
            return null;
        const [userId, role, expStr, sig] = parts;
        const exp = Number(expStr);
        if (!userId || !role || !exp || Date.now() > exp)
            return null;
        const payload = `${userId}|${role}|${exp}`;
        const expected = createHmac('sha256', config.adminSessionSecret).update(payload).digest('hex');
        const a = Buffer.from(sig);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b))
            return null;
        return { userId, role };
    }
    catch {
        return null;
    }
}
const cookieBase = () => ({
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: config.isProduction,
});
export function setUserCookie(res, userId, role) {
    res.cookie(USER_COOKIE, createUserSessionToken(userId, role), {
        ...cookieBase(),
        maxAge: config.sessionDays * 86400 * 1000,
    });
}
export function clearUserCookie(res) {
    res.clearCookie(USER_COOKIE, cookieBase());
}
export async function hashPassword(password) {
    return bcrypt.hash(password, config.bcryptRounds);
}
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function requireUser(roles) {
    return (req, res, next) => {
        const session = verifyUserSessionToken(req.cookies?.[USER_COOKIE]);
        if (!session) {
            res.status(401).json({ detail: 'Unauthorized' });
            return;
        }
        if (roles && !roles.includes(session.role)) {
            res.status(403).json({ detail: 'Forbidden' });
            return;
        }
        req.user = session;
        next();
    };
}
export async function findUserByEmail(email) {
    const r = await query('SELECT * FROM platform_users WHERE email = $1', [email.toLowerCase()]);
    return r.rows[0] ?? null;
}
export async function findUserById(id) {
    const r = await query('SELECT id, email, name, role, lawyer_id, status FROM platform_users WHERE id = $1', [id]);
    return r.rows[0] ?? null;
}
