const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function normalizeEmail(email) {
    const e = email.trim().toLowerCase().slice(0, 255);
    return EMAIL_RE.test(e) ? e : null;
}
export function validatePassword(password) {
    const p = password;
    if (p.length < 6 || p.length > 128)
        return null;
    return p;
}
export function sanitizeText(input, maxLen) {
    return input.trim().replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').slice(0, maxLen);
}
export function safeIdPart(input) {
    return input.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}
