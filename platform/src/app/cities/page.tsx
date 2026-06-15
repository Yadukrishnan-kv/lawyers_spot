import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { getCities, getPracticeAreas } from '@/lib/data';
import { cityPracticeHref } from '@/lib/seo-nav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find lawyers by City in India',
  description: 'Browse verified lawyers in 1200+ cities. City-wise legal services for divorce, property, criminal and more.',
};

export default async function CitiesIndexPage() {
  const cities = await getCities();
  const practiceAreas = await getPracticeAreas();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cities' }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">lawyers by City</h1>
      <p className="mt-2 text-slate-600">SEO landing pages for every major city in India</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {cities.map((city) => (
          <div key={city.slug} className="rounded-2xl border border-slate-200 p-6 dark:border-navy-700">
            <Link href={`/city/${city.slug}`} className="text-xl font-bold text-royal-600 hover:underline">
              lawyers in {city.name}
            </Link>
            <p className="text-sm text-slate-500">{city.state}</p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {practiceAreas.map((p) => (
                <li key={p.slug}>
                  <Link href={cityPracticeHref(city.slug, p.slug)} className="text-slate-600 hover:text-royal-600">
                    {p.name.replace(' Law', '')} in {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
