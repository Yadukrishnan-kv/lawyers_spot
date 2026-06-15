import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indian Kanoon — Case Law Search',
  description: 'Search Indian case law and statutes. Integrated legal research for advocates and citizens.',
};

export default function IndianKanoonPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Indian Kanoon' }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">Indian Kanoon</h1>
      <p className="mt-4 text-slate-600 leading-relaxed">
        Search judgments, acts, and legal documents across Indian courts. LawyerSpot integrates case-law
        research alongside lawyer discovery and free legal advice.
      </p>
      <form className="mt-8 flex gap-2">
        <input
          placeholder="Search cases, acts, sections..."
          className="h-12 flex-1 rounded-xl border px-4 dark:border-navy-700 dark:bg-navy-800"
        />
        <Button type="submit">Search</Button>
      </form>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-navy-700 dark:bg-navy-900">
        <p className="text-sm text-slate-600">
          Popular: <Link href="/ipc" className="text-royal-600">IPC Sections</Link>
          {' · '}
          <Link href="/bns" className="text-royal-600">BNS Sections</Link>
          {' · '}
          <Link href="/acts" className="text-royal-600">All Acts</Link>
        </p>
      </div>
    </div>
  );
}
