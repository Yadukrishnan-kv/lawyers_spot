import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ClientForgotPasswordForm } from '@/components/auth/client-forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Verify your registered email or phone number to reset your LawyerSpot password.',
};

export default function ClientForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Sign In', href: '/login' },
          { label: 'Reset Password' },
        ]}
      />
      <ClientForgotPasswordForm />
    </div>
  );
}
