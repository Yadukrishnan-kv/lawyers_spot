import Link from 'next/link';
import { LawyerCard } from '@/components/lawyer/lawyer-card';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { InternalLinksBlock } from '@/components/seo/internal-links';
import { getLawyers, getPracticeAreas, getCities, getStats, getSubscriptionPlans } from '@/lib/data';
import { filterLawyers } from '@/lib/search';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find lawyers in India',
  description: 'Search verified lawyers by city, practice area, rating and fees. Book consultations online.',
};

type Props = { searchParams: Promise<{ q?: string; city?: string; practice?: string; sort?: string }> };

export default async function LawyersPage({ searchParams }: Props) {
  const params = await searchParams;
  const [allLawyers, practiceAreas, cities, stats, plans] = await Promise.all([
    getLawyers(),
    getPracticeAreas(),
    getCities(),
    getStats(),
    getSubscriptionPlans(),
  ]);
  const lawyers = filterLawyers(allLawyers, params, plans);

  const lawyerStat = stats.find((s) => s.label.toLowerCase().includes('lawyer'))?.value ?? String(allLawyers.length);
  const cityStat = stats.find((s) => s.label.toLowerCase().includes('cit'))?.value ?? String(cities.length);

  const q = params.q ?? '';
  const city = params.city ?? '';
  const practice = params.practice ?? '';
  const sort = params.sort ?? 'rating';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Find Lawyers' }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">Find lawyers in India</h1>
      <p className="mt-2 text-slate-600">
        {lawyerStat} verified advocates across {cityStat} cities
      </p>

      <form method="get" className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, practice, location..."
          className="h-11 min-w-[200px] flex-1 rounded-xl border border-slate-200 px-4 text-sm dark:border-navy-700 dark:bg-navy-800"
        />
        <select
          name="city"
          defaultValue={city}
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm dark:border-navy-700 dark:bg-navy-800"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="practice"
          defaultValue={practice}
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm dark:border-navy-700 dark:bg-navy-800"
        >
          <option value="">All practice areas</option>
          {practiceAreas.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm dark:border-navy-700 dark:bg-navy-800"
        >
          <option value="rating">Highest Rated</option>
          <option value="experience">Most Experience</option>
          <option value="fee">Lowest Fees</option>
        </select>
        <button
          type="submit"
          className="h-11 rounded-xl bg-royal-600 px-6 text-sm font-semibold text-white hover:bg-royal-500"
        >
          Search
        </button>
        {(q || city || practice) && (
          <Link href="/lawyers" className="flex h-11 items-center text-sm text-royal-600">
            Clear
          </Link>
        )}
      </form>

      <div className="mt-10">
        <p className="mb-6 text-sm font-medium">{lawyers.length} lawyers found</p>
        {lawyers.length === 0 ? (
          <p className="text-slate-600">
            No lawyers match your search.{' '}
            <Link href="/search" className="text-royal-600">
              Try site-wide search
            </Link>{' '}
            or{' '}
            <Link href="/lawyer-signup" className="text-royal-600">
              list your practice
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lawyers.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
        )}
        <div className="mt-12">
          <InternalLinksBlock />
        </div>
      </div>
    </div>
  );
}
