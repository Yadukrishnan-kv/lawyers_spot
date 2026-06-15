/**
 * Session verification for Edge middleware (Web Crypto only — Node crypto is unavailable).
 */

const COOKIE_NAME = 'lawyerspot_admin_session';
const encoder = new TextEncoder();

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? 'lawyerspot-dev-secret-change-in-production';
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function decodeBase64Url(token: string): string {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export async function verifySessionTokenFromRequest(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    const decoded = decodeBase64Url(token);
    const parts = decoded.split('|');
    if (parts.length !== 3) return false;
    const [email, expStr, sig] = parts;
    const exp = Number(expStr);
    if (!email || !exp || Date.now() > exp) return false;
    const payload = `${email}|${exp}`;
    const expected = await hmacSha256Hex(getSecret(), payload);
    return timingSafeEqualHex(sig, expected);
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
