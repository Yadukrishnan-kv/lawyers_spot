import { Suspense } from 'react';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lawyer Sign In',
  description: 'Sign in to your LawyerSpot advocate dashboard.',
};

export default function LawyerLoginPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Lawyer Sign In' }]} />
      <Suspense fallback={<p className="mt-8 text-slate-500">Loading…</p>}>
        <LoginForm
          role="lawyer"
          title="Lawyer Sign In"
          signupHref="/lawyer-signup"
          dashboardHref="/lawyer-dashboard"
        />
      </Suspense>
    </div>
  );
}
