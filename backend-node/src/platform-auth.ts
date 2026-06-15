import bcrypt from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { config } from './config.js';
import { query } from './db.js';

export const USER_COOKIE = 'lawyerspot_user_session';

export function createUserSessionToken(userId: string, role: string): string {
  const exp = Date.now() + config.sessionDays * 24 * 60 * 60 * 1000;
  const payload = `${userId}|${role}|${exp}`;
  const sig = createHmac('sha256', config.adminSessionSecret).update(payload).digest('hex');
  return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

export function verifyUserSessionToken(token: string | undefined): { userId: string; role: string } | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split('|');
    if (parts.length !== 4) return null;
    const [userId, role, expStr, sig] = parts;
    const exp = Number(expStr);
    if (!userId || !role || !exp || Date.now() > exp) return null;
    const payload = `${userId}|${role}|${exp}`;
    const expected = createHmac('sha256', config.adminSessionSecret).update(payload).digest('hex');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

const cookieBase = () => ({
  httpOnly: true,
  sameSite: 'strict' as const,
  path: '/',
  secure: config.isProduction,
});

export function setUserCookie(res: Response, userId: string, role: string) {
  res.cookie(USER_COOKIE, createUserSessionToken(userId, role), {
    ...cookieBase(),
    maxAge: config.sessionDays * 86400 * 1000,
  });
}

export function clearUserCookie(res: Response) {
  res.clearCookie(USER_COOKIE, cookieBase());
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, config.bcryptRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function requireUser(roles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = verifyUserSessionToken(req.cookies?.[USER_COOKIE] as string | undefined);
    if (!session) {
      res.status(401).json({ detail: 'Unauthorized' });
      return;
    }
    if (roles && !roles.includes(session.role)) {
      res.status(403).json({ detail: 'Forbidden' });
      return;
    }
    (req as Request & { user: { userId: string; role: string } }).user = session;
    next();
  };
}

export async function findUserByEmail(email: string) {
  const r = await query<{
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: string;
    lawyer_id: string | null;
    status: string;
  }>('SELECT * FROM platform_users WHERE email = $1', [email.toLowerCase()]);
  return r.rows[0] ?? null;
}

export async function findUserById(id: string) {
  const r = await query<{
    id: string;
    email: string;
    name: string;
    role: string;
    lawyer_id: string | null;
    status: string;
  }>('SELECT id, email, name, role, lawyer_id, status FROM platform_users WHERE id = $1', [id]);
  return r.rows[0] ?? null;
}
