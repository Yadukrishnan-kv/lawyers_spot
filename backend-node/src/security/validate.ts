const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string | null {
  const e = email.trim().toLowerCase().slice(0, 255);
  return EMAIL_RE.test(e) ? e : null;
}

export function validatePassword(password: string): string | null {
  const p = password;
  if (p.length < 8 || p.length > 128) return null;
  return p;
}

export function sanitizeText(input: string, maxLen: number): string {
  return input.trim().replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').slice(0, maxLen);
}

export function safeIdPart(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}
