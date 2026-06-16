import { createHmac, timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { config } from './config.js';

export function createSessionToken(email: string): string {
  const exp = Date.now() + config.sessionDays * 24 * 60 * 60 * 1000;
  const payload = `${email}|${exp}`;
  const sig = createHmac('sha256', config.adminSessionSecret).update(payload).digest('hex');
  return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split('|');
    if (parts.length !== 3) return null;
    const [email, expStr, sig] = parts;
    const exp = Number(expStr);
    if (!email || !exp || Date.now() > exp) return null;
    const payload = `${email}|${exp}`;
    const expected = createHmac('sha256', config.adminSessionSecret).update(payload).digest('hex');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return email;
  } catch {
    return null;
  }
}

const cookieOpts = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: config.isProduction,
  maxAge: config.sessionDays * 86400 * 1000,
});

export function setSessionCookie(res: Response, email: string) {
  res.cookie(config.cookieName, createSessionToken(email), cookieOpts());
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: config.isProduction,
  });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[config.cookieName] as string | undefined;
  const email = verifySessionToken(token);
  if (!email) {
    res.status(401).json({ detail: 'Unauthorized' });
    return;
  }
  next();
}
