'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signupUser } from '@/lib/user-auth';

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    try {
      await signupUser(String(fd.get('name')), String(fd.get('email')), password);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">Create Account</h1>
      <p className="mt-2 text-slate-600">Book lawyers, save profiles, and manage consultations.</p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-semibold">Full Name</label>
          <input name="name" required className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800" />
        </div>
        <div>
          <label className="text-sm font-semibold">Email</label>
          <input name="email" type="email" required className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800" />
        </div>
        <div>
          <label className="text-sm font-semibold">Password</label>
          <input name="password" type="password" required minLength={6} className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800" />
        </div>
        <div>
          <label className="text-sm font-semibold">Confirm Password</label>
          <input name="confirm" type="password" required minLength={6} className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign Up'}
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
