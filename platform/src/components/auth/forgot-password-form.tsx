'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  requestLawyerPasswordOtp,
  verifyLawyerPasswordOtp,
  setLawyerNewPassword,
} from '@/lib/user-auth';

type Step = 'phone' | 'otp' | 'password' | 'done';

const RESEND_COOLDOWN = 60;

export function LawyerForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function sendOtp(isResend = false) {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const res = await requestLawyerPasswordOtp(phone);
      setStep('otp');
      setCooldown(RESEND_COOLDOWN);
      setNotice(res.message ?? 'If this number belongs to a lawyer account, an OTP has been sent.');
      if (isResend) setNotice('A new OTP has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitPhone(e: React.FormEvent) {
    e.preventDefault();
    await sendOtp(false);
  }

  async function onSubmitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const res = await verifyLawyerPasswordOtp(phone, code);
      setResetToken(res.resetToken);
      setStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await setLawyerNewPassword(resetToken, password, confirmPassword);
      setStep('done');
      setTimeout(() => router.push('/lawyer-login'), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password');
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800';

  return (
    <div className="mt-6">
      <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">
        Reset Password
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Verified advocates can set a password using their registered phone number.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {notice && !error && <p className="mt-4 text-sm text-green-600">{notice}</p>}

      {step === 'phone' && (
        <form className="mt-6 space-y-4" onSubmit={onSubmitPhone}>
          <div>
            <label className="text-sm font-semibold">Registered phone number</label>
            <input
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <form className="mt-6 space-y-4" onSubmit={onSubmitOtp}>
          <div>
            <label className="text-sm font-semibold">Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              required
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={inputCls}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify OTP'}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-slate-500 hover:text-royal-600"
              onClick={() => {
                setStep('phone');
                setCode('');
                setNotice('');
                setError('');
              }}
            >
              Change number
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || loading}
              className="font-semibold text-royal-600 disabled:opacity-50"
              onClick={() => sendOtp(true)}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}

      {step === 'password' && (
        <form className="mt-6 space-y-4" onSubmit={onSubmitPassword}>
          <div>
            <label className="text-sm font-semibold">New password</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Confirm new password</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Set Password'}
          </Button>
        </form>
      )}

      {step === 'done' && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40">
          Password updated successfully. Redirecting you to sign in…
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Remembered your password?{' '}
        <Link href="/lawyer-login" className="font-semibold text-royal-600">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
