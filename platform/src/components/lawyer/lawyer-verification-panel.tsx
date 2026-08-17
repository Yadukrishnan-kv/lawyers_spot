'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VerificationBadges } from '@/components/lawyer/verification-badges';
import type { Lawyer } from '@/lib/data-types';
import {
  fetchCurrentUser,
  requestLawyerEmailVerifyOtp,
  confirmLawyerEmailVerifyOtp,
  requestLawyerPhoneVerifyOtp,
  confirmLawyerPhoneVerifyOtp,
} from '@/lib/user-auth';

const RESEND_COOLDOWN = 60;

function VerifyChannel({
  label,
  onRequestOtp,
  onConfirmOtp,
  onVerified,
}: {
  label: string;
  onRequestOtp: () => Promise<{ success: boolean }>;
  onConfirmOtp: (code: string) => Promise<{ success: boolean }>;
  onVerified: () => void;
}) {
  const [step, setStep] = useState<'idle' | 'otp'>('idle');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function send() {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await onRequestOtp();
      setStep('otp');
      setCooldown(RESEND_COOLDOWN);
      setNotice('A verification code has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onConfirmOtp(code);
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'idle') {
    return (
      <div className="mt-3">
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <Button type="button" size="sm" variant="secondary" disabled={loading} onClick={send}>
          {loading ? 'Sending…' : `Verify ${label}`}
        </Button>
      </div>
    );
  }

  return (
    <form className="mt-3 space-y-2" onSubmit={confirm}>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {notice && !error && <p className="text-xs text-green-600">{notice}</p>}
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          required
          autoComplete="one-time-code"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className="h-9 w-32 rounded-lg border px-3 text-sm dark:border-navy-700 dark:bg-navy-800"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify'}
        </Button>
        <button
          type="button"
          disabled={cooldown > 0 || loading}
          className="text-xs font-semibold text-royal-600 disabled:opacity-50"
          onClick={send}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
        </button>
      </div>
    </form>
  );
}

export function LawyerVerificationPanel() {
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await fetchCurrentUser();
        if (!user?.lawyerId) {
          setError('No lawyer profile linked to this account.');
          return;
        }
        const res = await fetch(`/api/lawyer/profile`, { credentials: 'include' });
        if (!res.ok) throw new Error('Could not load profile');
        const data = (await res.json()) as { lawyer: Lawyer };
        if (!cancelled) setLawyer(data.lawyer);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-slate-500">Loading verification status…</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !lawyer) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-slate-500">{error || 'Profile unavailable'}</p>
        </CardContent>
      </Card>
    );
  }

  const allVerified = lawyer.emailVerified && lawyer.phoneVerified;

  return (
    <Card>
      <CardContent>
        <h2 className="font-bold text-navy-900 dark:text-white">Account verification</h2>
        <p className="mt-1 text-sm text-slate-500">
          {allVerified
            ? 'Your email and mobile number are verified.'
            : 'Complete verification to build trust with clients.'}
        </p>
        <div className="mt-4">
          <VerificationBadges lawyer={lawyer} size="md" layout="stack" />
        </div>
        {!lawyer.emailVerified && (
          <VerifyChannel
            label="email"
            onRequestOtp={requestLawyerEmailVerifyOtp}
            onConfirmOtp={confirmLawyerEmailVerifyOtp}
            onVerified={() => setLawyer((prev) => (prev ? { ...prev, emailVerified: true } : prev))}
          />
        )}
        {!lawyer.phoneVerified && lawyer.phone && (
          <VerifyChannel
            label="phone"
            onRequestOtp={requestLawyerPhoneVerifyOtp}
            onConfirmOtp={confirmLawyerPhoneVerifyOtp}
            onVerified={() => setLawyer((prev) => (prev ? { ...prev, phoneVerified: true } : prev))}
          />
        )}
      </CardContent>
    </Card>
  );
}
