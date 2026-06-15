'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUserSession } from '@/components/auth/user-session-provider';
import { loginUser } from '@/lib/user-auth';

type Props = { role?: 'client' | 'lawyer'; title: string; signupHref: string; dashboardHref: string };

export function LoginForm({ role, title, signupHref, dashboardHref }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useUserSession();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = await loginUser(String(fd.get('email')), String(fd.get('password')), role);
      const from = searchParams.get('from');
      let target = from || dashboardHref;
      if (data.role === 'lawyer') {
        target = from?.startsWith('/lawyer') ? from : '/lawyer-dashboard';
      } else if (role === 'lawyer') {
        target = '/dashboard';
      }
      await refresh();
      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">{title}</h1>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-semibold">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        No account?{' '}
        <Link href={signupHref} className="font-semibold text-royal-600">
          Sign up
        </Link>
      </p>
    </>
  );
}
