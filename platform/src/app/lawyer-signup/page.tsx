import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { LawyerSignupForm } from '@/components/auth/lawyer-signup-form';
import { getStats } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lawyer Signup — Join LawyerSpot',
  description: 'Register as a verified lawyer on LawyerSpot. Get leads, manage consultations, and grow your practice.',
};

export default async function LawyerSignupPage() {
  const stats = await getStats();
  const lawyerStat = stats.find((s) => s.label.toLowerCase().includes('lawyer'))?.value ?? 'verified advocates';

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Lawyer Signup' }]} />
      <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">Lawyer Signup</h1>
      <p className="mt-2 text-slate-600">Join {lawyerStat} on India&apos;s legal intelligence platform</p>
      <LawyerSignupForm />
    </div>
  );
}
