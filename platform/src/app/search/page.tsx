import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { searchCms } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search lawyers, articles, legal Q&A, acts and courts on LawyerSpot.',
};

type Props = { searchParams: Promise<{ q?: string }> };

const typeLabels = {
  lawyer: 'Lawyer',
  article: 'Article',
  qa: 'Q&A',
  act: 'Act',
  court: 'Court',
  guide: 'Guide',
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const results = q.trim() ? await searchCms(q.trim()) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />
      <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">Search LawyerSpot</h1>
      <form method="get" className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search lawyers, articles, acts, courts..."
          className="h-12 flex-1 rounded-xl border border-slate-200 px-4 dark:border-navy-700 dark:bg-navy-800"
          required
        />
        <button type="submit" className="rounded-xl bg-royal-600 px-6 font-semibold text-white hover:bg-royal-500">
          Search
        </button>
      </form>

      {q && (
        <p className="mt-4 text-sm text-slate-600">
          {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{q}&quot;
        </p>
      )}

      <ul className="mt-8 divide-y divide-slate-200 dark:divide-navy-700">
        {results.map((r) => (
          <li key={`${r.type}-${r.href}`} className="py-4">
            <span className="text-xs font-semibold uppercase text-royal-600">{typeLabels[r.type]}</span>
            <Link href={r.href} className="mt-1 block font-semibold text-navy-900 hover:text-royal-600 dark:text-white">
              {r.title}
            </Link>
            <p className="text-sm text-slate-600">{r.excerpt}</p>
          </li>
        ))}
      </ul>

      {q && results.length === 0 && (
        <p className="mt-8 text-slate-600">No results. Try different keywords or browse <Link href="/lawyers">lawyers</Link>.</p>
      )}
    </div>
  );
}
