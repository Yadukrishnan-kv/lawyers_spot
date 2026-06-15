import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { getSiteContent } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indian Acts & Legal Sections',
  description: 'Browse IPC, RERA, GST, IT Act sections with plain-English explanations.',
};

export default async function ActsPage() {
  const { acts } = await getSiteContent();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Acts & Sections' }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">Acts & Sections</h1>
      <p className="mt-2 text-slate-600">AI-ready legal content architecture for millions of act/section pages</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {acts.map((a) => (
          <Link
            key={a.slug}
            href={`/acts/${a.slug}`}
            className="rounded-2xl border border-slate-200 p-6 hover:border-royal-500 dark:border-navy-700"
          >
            <span className="text-xs font-bold text-royal-600">{a.act}</span>
            <h2 className="mt-2 font-bold text-navy-900 dark:text-white">{a.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
