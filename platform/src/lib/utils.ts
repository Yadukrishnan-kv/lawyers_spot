import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLawyerFee(lawyer: { fee?: number; currency?: string }): string {
  if (lawyer.fee == null) return '—';
  const sym: Record<string, string> = { INR: '₹', GBP: '£', USD: '$', AED: 'AED ' };
  const prefix = sym[lawyer.currency ?? 'INR'] ?? '₹';
  return `${prefix}${lawyer.fee.toLocaleString('en-IN')}`;
}

export function getBookingFeeLabel(lawyer: { fee?: number; currency?: string }): string {
  const fee = formatLawyerFee(lawyer);
  return fee === '—' ? 'Contact for pricing' : fee;
}

/** Mask phone for display, e.g. 9810981039 → 9810****39 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return phone;
  const visibleStart = Math.min(4, digits.length - 4);
  const visibleEnd = 2;
  const maskedLen = digits.length - visibleStart - visibleEnd;
  if (maskedLen <= 0) return digits;
  return `${digits.slice(0, visibleStart)}${'*'.repeat(Math.max(4, maskedLen))}${digits.slice(-visibleEnd)}`;
}
