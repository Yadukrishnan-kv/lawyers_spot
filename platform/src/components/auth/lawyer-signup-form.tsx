'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  startLawyerSignup,
  verifyLawyerSignupPhone,
  verifyLawyerSignupEmail,
  resendLawyerSignupPhoneOtp,
  resendLawyerSignupEmailOtp,
} from '@/lib/user-auth';
import { useCms } from '@/lib/cms/context';

type Step = 'form' | 'phone-otp' | 'email-otp';

const RESEND_COOLDOWN = 60;

export function LawyerSignupForm() {
  const router = useRouter();
  const { practiceAreas, cities } = useCms();
  const [step, setStep] = useState<Step>('form');
  const [pendingId, setPendingId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
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
    const enteredEmail = String(fd.get('email'));
    try {
      const res = await startLawyerSignup({
        name: String(fd.get('name')),
        email: enteredEmail,
        password,
        phone: enteredPhone,
        practice: String(fd.get('practice')),
        barId: String(fd.get('barId')),
        citySlug: String(fd.get('citySlug')),
      });
      setPendingId(res.pendingId);
      setPhone(enteredPhone);
      setEmail(enteredEmail);
      setStep('phone-otp');
      setCooldown(RESEND_COOLDOWN);
      setNotice('An OTP has been sent to your phone number.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await verifyLawyerSignupPhone(pendingId, phoneCode);
      setStep('email-otp');
      setCooldown(RESEND_COOLDOWN);
      setNotice(`A verification code has been sent to ${email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitEmailOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyLawyerSignupEmail(pendingId, emailCode);
      router.push('/lawyer-dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  }

  async function onResendPhone() {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await resendLawyerSignupPhoneOtp(pendingId);
      setCooldown(RESEND_COOLDOWN);
      setNotice('A new OTP has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  }

  async function onResendEmail() {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await resendLawyerSignupEmailOtp(pendingId);
      setCooldown(RESEND_COOLDOWN);
      setNotice('A new code has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800';

  if (step === 'phone-otp') {
    return (
      <div className="mt-8">
        <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">Verify Your Phone</h1>
        <p className="mt-2 text-slate-600">Enter the OTP sent to {phone}.</p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {notice && !error && <p className="mt-4 text-sm text-green-600">{notice}</p>}
        <form className="mt-6 space-y-4" onSubmit={onSubmitPhoneOtp}>
          <div>
            <label className="text-sm font-semibold">Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              required
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
              className={inputCls}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify Phone'}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-slate-500 hover:text-royal-600"
              onClick={() => {
                setStep('form');
                setPhoneCode('');
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
              onClick={onResendPhone}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 'email-otp') {
    return (
      <div className="mt-8">
        <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">Verify Your Email</h1>
        <p className="mt-2 text-slate-600">Enter the verification code sent to {email}.</p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {notice && !error && <p className="mt-4 text-sm text-green-600">{notice}</p>}
        <form className="mt-6 space-y-4" onSubmit={onSubmitEmailOtp}>
          <div>
            <label className="text-sm font-semibold">Enter Code</label>
            <input
              type="text"
              inputMode="numeric"
              required
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
              className={inputCls}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & Submit Application'}
          </Button>
          <div className="flex items-center justify-end text-sm">
            <button
              type="button"
              disabled={cooldown > 0 || loading}
              className="font-semibold text-royal-600 disabled:opacity-50"
              onClick={onResendEmail}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmitForm}>
      <div>
        <label className="text-sm font-semibold">Full Name</label>
        <input name="name" required className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-semibold">Bar Council Enrollment No.</label>
        <input name="barId" required className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-semibold">Email</label>
        <input name="email" type="email" required className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-semibold">Phone</label>
        <input name="phone" type="tel" required className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-semibold">City</label>
        <select name="citySlug" required className={inputCls}>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}, {c.state}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold">Primary Practice Area</label>
        <select name="practice" required className={inputCls}>
          {practiceAreas.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold">Password</label>
        <input name="password" type="password" required minLength={6} className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-semibold">Confirm Password</label>
        <input name="confirm" type="password" required minLength={6} className={inputCls} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Sending OTP…' : 'Submit Application'}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Already registered?{' '}
        <Link href="/lawyer-login" className="font-semibold text-royal-600">
          Lawyer login
        </Link>
      </p>
    </form>
  );
}
