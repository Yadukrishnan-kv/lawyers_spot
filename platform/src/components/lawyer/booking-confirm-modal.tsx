'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Calendar, Lock, Mail, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (details: { clientName: string; clientEmail: string }) => Promise<void>;
  lawyerName: string;
  feeLabel: string;
  bookingDate: string;
  time: string;
  consultType: string;
  loading?: boolean;
  error?: string;
};

function formatBookingDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function BookingConfirmModal({
  open,
  onClose,
  onConfirm,
  lawyerName,
  feeLabel,
  bookingDate,
  time,
  consultType,
  loading = false,
  error: externalError = '',
}: Props) {
  const titleId = useId();
  const nameId = useId();
  const emailId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (!open) return;
    setFieldError('');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => {
        panelRef.current?.querySelector<HTMLInputElement>('input')?.focus();
      }, 50);
      return () => window.clearTimeout(t);
    }
    setClientName('');
    setClientEmail('');
    setFieldError('');
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError('');
    const name = clientName.trim();
    const email = clientEmail.trim();
    if (!name) {
      setFieldError('Please enter your full name.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Please enter a valid email address.');
      return;
    }
    await onConfirm({ clientName: name, clientEmail: email });
  }

  const displayError = fieldError || externalError;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onClick={() => !loading && onClose()}
    >
      <div
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl',
          'dark:border-navy-700 dark:bg-navy-900',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-royal-600 to-navy-800 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Secure booking
              </p>
              <h2 id={titleId} className="mt-1 font-display text-xl font-bold">
                Confirm consultation
              </h2>
              <p className="mt-1 text-sm text-white/85">with {lawyerName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-navy-700 dark:bg-navy-800/50">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-royal-600">
              <Calendar className="h-4 w-4" />
              Session details
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Date</dt>
                <dd className="text-end font-medium text-navy-900 dark:text-white">
                  {formatBookingDate(bookingDate)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Time</dt>
                <dd className="font-medium text-navy-900 dark:text-white">{time}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Type</dt>
                <dd className="text-end font-medium text-navy-900 dark:text-white">{consultType}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-2 dark:border-navy-600">
                <dt className="text-slate-500">Fee</dt>
                <dd className="font-bold text-navy-900 dark:text-white">{feeLabel}</dd>
              </div>
            </dl>
          </div>

          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Enter your details to complete the booking. We&apos;ll send confirmation to your email.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor={nameId} className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy-900 dark:text-white">
                <User className="h-4 w-4 text-royal-600" />
                Full name
              </label>
              <input
                id={nameId}
                type="text"
                autoComplete="name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={loading}
                placeholder="e.g. Rahul Sharma"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 disabled:opacity-60 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor={emailId} className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy-900 dark:text-white">
                <Mail className="h-4 w-4 text-royal-600" />
                Email address
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 disabled:opacity-60 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              />
            </div>
          </div>

          {displayError && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {displayError}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" disabled={loading} onClick={onClose} className="sm:min-w-[120px]">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-royal-600 hover:bg-royal-500 sm:min-w-[160px]"
            >
              {loading ? 'Confirming…' : 'Confirm booking'}
            </Button>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Encrypted &amp; confidential · Attorney-client privilege applies
          </p>
        </form>
      </div>
    </div>
  );
}
