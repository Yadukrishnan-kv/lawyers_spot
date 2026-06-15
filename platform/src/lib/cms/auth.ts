import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'lawyerspot_admin_session';
const SESSION_DAYS = 7;
export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL ?? 'admin@lawyerspot.com',
    password: process.env.ADMIN_PASSWORD ?? 'admin123',
  };
}

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? 'lawyerspot-dev-secret-change-in-production';
}

export function createSessionToken(email: string): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${email}|${exp}`;
  const sig = createHmac('sha256', getSecret()).update(payload).digest('hex');
  return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

export function verifySessionToken(token: string): { valid: boolean; email?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split('|');
    if (parts.length !== 3) return { valid: false };
    const [email, expStr, sig] = parts;
    const exp = Number(expStr);
    if (!email || !exp || Date.now() > exp) return { valid: false };
    const payload = `${email}|${exp}`;
    const expected = createHmac('sha256', getSecret()).update(payload).digest('hex');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return { valid: false };
    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

export async function setSessionCookie(email: string) {
  const token = createSessionToken(email);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, sessionCookieOptions());
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const result = verifySessionToken(token);
  if (!result.valid || !result.email) return null;
  return { email: result.email };
}

export function verifySessionTokenFromRequest(token: string | undefined): boolean {
  if (!token) return false;
  return verifySessionToken(token).valid;
}

export { COOKIE_NAME };
