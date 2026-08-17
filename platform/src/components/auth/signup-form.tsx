'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { startClientSignup, verifyClientSignupPhone, resendClientSignupPhoneOtp } from '@/lib/user-auth';

type Step = 'form' | 'otp';

const RESEND_COOLDOWN = 60;

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [pendingId, setPendingId] = useState('');
  const [phone, setPhone] = useState('');
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

  async function onSubmitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password'));
    const confirm = String(fd.get('confirm'));
    if (password !== confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    const enteredPhone = String(fd.get('phone'));
    try {
      const res = await startClientSignup({
        name: String(fd.get('name')),
        email: String(fd.get('email')),
        password,
        phone: enteredPhone,
      });
      setPendingId(res.pendingId);
      setPhone(enteredPhone);
      setStep('otp');
      setCooldown(RESEND_COOLDOWN);
      setNotice('An OTP has been sent to your phone number.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyClientSignupPhone(pendingId, code);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await resendClientSignupPhoneOtp(pendingId);
      setCooldown(RESEND_COOLDOWN);
      setNotice('A new OTP has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800';

  if (step === 'otp') {
    return (
      <>
        <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">Verify Your Phone</h1>
        <p className="mt-2 text-slate-600">Enter the OTP sent to {phone} to finish creating your account.</p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {notice && !error && <p className="mt-4 text-sm text-green-600">{notice}</p>}
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
            {loading ? 'Verifying…' : 'Verify & Create Account'}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-slate-500 hover:text-royal-600"
              onClick={() => {
                setStep('form');
                setCode('');
                setNotice('');
                setError('');
              }}
            >
              Change details
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || loading}
              className="font-semibold text-royal-600 disabled:opacity-50"
              onClick={onResend}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">Create Account</h1>
      <p className="mt-2 text-slate-600">Book lawyers, save profiles, and manage consultations.</p>
      <form className="mt-8 space-y-4" onSubmit={onSubmitForm}>
        <div>
          <label className="text-sm font-semibold">Full Name</label>
          <input name="name" required placeholder="e.g. John Doe" className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-semibold">Email</label>
          <input name="email" type="email" required placeholder="you@example.com" className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-semibold">Phone Number</label>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="e.g. 9876543210" className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-semibold">Password</label>
          <input name="password" type="password" required minLength={6} placeholder="At least 6 characters" className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-semibold">Confirm Password</label>
          <input name="confirm" type="password" required minLength={6} placeholder="Re-enter your password" className={inputCls} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Sending OTP…' : 'Sign Up'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-royal-600">
          Sign in
        </Link>
      </p>
    </>
  );
}
