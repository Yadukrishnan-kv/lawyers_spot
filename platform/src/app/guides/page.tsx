import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { getArticles, getSiteContent } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Guides & Law Guides India',
  description: 'Free legal guides on divorce, property, tax, criminal law and more — written for Indian law.',
};

export default async function GuidesPage() {
  const { legalGuides } = await getSiteContent();
  const articles = await getArticles();
  const all = [...legalGuides, ...articles.map((a) => ({ slug: a.slug, title: a.title, category: a.category }))];
  const unique = Array.from(new Map(all.map((g) => [g.slug, g])).values());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Law Guides' }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">Popular Law Guides</h1>
      <p className="mt-2 text-slate-600">Long-form SEO content — scalable to thousands of guides</p>
      <ul className="mt-10 divide-y divide-slate-200 dark:divide-navy-700">
        {unique.map((g) => (
          <li key={g.slug} className="py-5">
            <Link href={`/articles/${g.slug}`} className="group flex flex-wrap items-center justify-between gap-2">
              <span className="text-lg font-semibold group-hover:text-royal-600">{g.title}</span>
              <span className="text-xs font-bold text-royal-600">{g.category}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
