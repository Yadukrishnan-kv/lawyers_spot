'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { lawyerSignup } from '@/lib/user-auth';
import { useCms } from '@/lib/cms/context';

export function LawyerSignupForm() {
  const router = useRouter();
  const { practiceAreas, cities } = useCms();
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
      await lawyerSignup({
        name: String(fd.get('name')),
        email: String(fd.get('email')),
        password,
        phone: String(fd.get('phone')),
        practice: String(fd.get('practice')),
        barId: String(fd.get('barId')),
        citySlug: String(fd.get('citySlug')),
      });
      router.push('/lawyer-dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="text-sm font-semibold">Full Name</label>
        <input name="name" required className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800" />
      </div>
      <div>
        <label className="text-sm font-semibold">Bar Council Enrollment No.</label>
        <input name="barId" required className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800" />
      </div>
      <div>
        <label className="text-sm font-semibold">Email</label>
        <input name="email" type="email" required className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800" />
      </div>
      <div>
        <label className="text-sm font-semibold">Phone</label>
        <input name="phone" type="tel" required className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800" />
      </div>
      <div>
        <label className="text-sm font-semibold">City</label>
        <select name="citySlug" required className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800">
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}, {c.state}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold">Primary Practice Area</label>
        <select name="practice" required className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800">
          {practiceAreas.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
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
        {loading ? 'Submitting…' : 'Submit Application'}
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
