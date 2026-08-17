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
/**
 * Returns the last 10 digits of a phone number, used to match against phone
 * values stored in raw (un-normalized) form from Excel imports. Returns null
 * when there aren't at least 10 digits.
 */
export function phoneDigits(input) {
    const digits = String(input ?? '').replace(/\D/g, '');
    if (digits.length < 10)
        return null;
    return digits.slice(-10);
}
/**
 * Normalizes a phone number to E.164 for Twilio. Accepts a leading '+' with
 * country code, a country code without '+', or a bare 10-digit local number
 * (to which the default country code is prepended). Returns null if invalid.
 */
export function normalizePhone(input, defaultCountryCode = '+91') {
    const trimmed = String(input ?? '').trim();
    if (!trimmed)
        return null;
    const hasPlus = trimmed.startsWith('+');
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15)
        return null;
    if (hasPlus)
        return `+${digits}`;
    if (digits.length === 10) {
        const cc = defaultCountryCode.replace(/\D/g, '');
        return `+${cc}${digits}`;
    }
    // 11-15 digits without '+': assume country code is already included.
    return `+${digits}`;
}
