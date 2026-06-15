import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { getSiteContent } from '@/lib/data';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { courtsPage } = await getSiteContent();
  return {
    title: courtsPage.metaTitle,
    description: courtsPage.metaDescription,
  };
}

export default async function CourtsIndexPage() {
  const { courts, courtsPage } = await getSiteContent();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Courts' }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">
        {courtsPage.title}
      </h1>
      <p className="mt-2 text-slate-600">{courtsPage.subtitle}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courts.map((c) => (
          <Link
            key={c.slug}
            href={`/court/${c.slug}`}
            className="rounded-2xl border border-slate-200 p-6 transition hover:border-royal-500 hover:shadow-soft dark:border-navy-700"
          >
            <h2 className="font-bold text-navy-900 dark:text-white">{c.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{c.city}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
