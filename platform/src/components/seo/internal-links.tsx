import Link from 'next/link';
import { getCities, getPracticeAreas, getTrendingTopics } from '@/lib/data';
import { practiceAreaPath } from '@/lib/practice-utils';

export async function InternalLinksBlock({ city, practice }: { city?: string; practice?: string }) {
  const trendingTopics = await getTrendingTopics();
  const cities = await getCities();
  const practiceAreas = await getPracticeAreas();

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-navy-700 dark:bg-navy-900/50">
      <h2 className="font-display text-lg font-bold text-navy-900 dark:text-white">Related Searches</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {trendingTopics.map((t) => (
          <Link
            key={t}
            href={`/articles?q=${encodeURIComponent(t)}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-royal-500 hover:text-royal-600 dark:border-navy-700 dark:bg-navy-800"
          >
            {t}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-navy-900 dark:text-white">Nearby Cities</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {cities.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link href={`/city/${c.slug}`} className="text-royal-600 hover:underline">
                  {practice ? `${practice} lawyers in ${c.name}` : `lawyers in ${c.name}`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-navy-900 dark:text-white">Practice Areas</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {practiceAreas.slice(0, 5).map((p) => (
              <li key={p.slug}>
                <Link href={practiceAreaPath(p)} className="text-royal-600 hover:underline">
                  {city ? `${p.name} in ${city}` : p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
