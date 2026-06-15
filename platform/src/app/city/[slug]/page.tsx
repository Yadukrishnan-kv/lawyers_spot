import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { InternalLinksBlock } from '@/components/seo/internal-links';
import { LawyerCard } from '@/components/lawyer/lawyer-card';
import { getLawyers, getCityBySlug, getPracticeAreas } from '@/lib/data';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) return { title: 'City' };
  return {
    title: `Lawyers in ${city.name} | Verified Advocates`,
    description: `Find top-rated lawyers in ${city.name}, ${city.state}. Book consultations for divorce, property, criminal & corporate matters.`,
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const cityLawyers = (await getLawyers()).filter(
    (l) =>
      l.citySlug === city.slug ||
      l.location.toLowerCase().includes(city.name.toLowerCase()),
  );
  const practiceAreas = await getPracticeAreas();

  return (
    <div>
      <div className="bg-navy-900 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cities', href: '/lawyers' }, { label: city.name }]} />
          <h1 className="font-display text-4xl font-bold">Lawyers in {city.name}</h1>
          <p className="mt-2 text-slate-300">{city.state} · 1,200+ verified advocates · Book online consultations</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cityLawyers.map((l) => <LawyerCard key={l.id} lawyer={l} />)}
        </div>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">Popular Legal Services in {city.name}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {practiceAreas.slice(0, 6).map((p) => (
              <a
                key={p.slug}
                href={`/city/${city.slug}/${p.slug}`}
                className="rounded-xl border border-slate-200 p-4 text-sm font-medium hover:border-royal-500 dark:border-navy-700"
              >
                {p.name} in {city.name}
              </a>
            ))}
          </div>
        </section>
        <section className="mt-12 rounded-2xl border p-6 dark:border-navy-700">
          <h2 className="font-bold">FAQs — Lawyers in {city.name}</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="font-semibold">How do I find a verified lawyer in {city.name}?</dt>
              <dd className="mt-1 text-sm text-slate-600">Browse profiles, compare ratings and book consultations directly on LawyerSpot.</dd>
            </div>
            <div>
              <dt className="font-semibold">What are typical consultation fees?</dt>
              <dd className="mt-1 text-sm text-slate-600">Fees range from ₹500 to ₹10,000 depending on experience and practice area.</dd>
            </div>
          </dl>
        </section>
        <div className="mt-12"><InternalLinksBlock city={city.name} /></div>
      </div>
    </div>
  );
}
