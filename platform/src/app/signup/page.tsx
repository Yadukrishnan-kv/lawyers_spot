import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { SignupForm } from '@/components/auth/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a free LawyerSpot account to book consultations and manage your legal needs.',
};

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Sign Up' }]} />
      <SignupForm />
    </div>
  );
}
