import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { LawyerForgotPasswordForm } from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Verify your registered phone number to reset your LawyerSpot advocate password.',
};

export default function LawyerForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Lawyer Sign In', href: '/lawyer-login' },
          { label: 'Reset Password' },
        ]}
      />
      <LawyerForgotPasswordForm />
    </div>
  );
}
