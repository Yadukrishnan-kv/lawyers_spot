import { Suspense } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your LawyerSpot account to manage bookings and saved lawyers.',
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Sign In' }]} />
      <Suspense fallback={<p className="mt-8 text-slate-500">Loading…</p>}>
        <LoginForm
          title="Sign In"
          signupHref="/signup"
          dashboardHref="/dashboard"
        />
        <p className="mt-4 text-center text-sm text-slate-500">
          Advocate account?{' '}
          <Link href="/lawyer-login" className="font-semibold text-royal-600">
            Lawyer sign in
          </Link>
        </p>
      </Suspense>
    </div>
  );
}
