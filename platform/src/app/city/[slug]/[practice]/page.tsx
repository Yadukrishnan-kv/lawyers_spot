import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { InternalLinksBlock } from '@/components/seo/internal-links';
import { LawyerCard } from '@/components/lawyer/lawyer-card';
import { getCityBySlug, getPracticeBySlug, getLawyers } from '@/lib/data';
import { filterLawyersByPractice } from '@/lib/practice-utils';
import { filterLawyers } from '@/lib/search';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string; practice: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, practice } = await params;
  const city = await getCityBySlug(slug);
  const area = await getPracticeBySlug(practice);
  if (!city || !area) return { title: 'Lawyers' };
  const title = `${area.name.replace(' Law', '')} Lawyers in ${city.name}`;
  return {
    title,
    description: `Find top ${title.toLowerCase()}. Compare ratings, fees & book consultations.`,
  };
}

export default async function CityPracticePage({ params }: Props) {
  const { slug, practice } = await params;
  const city = await getCityBySlug(slug);
  const area = await getPracticeBySlug(practice);
  if (!city || !area) notFound();

  const title = `${area.name.replace(' Law', '')} Lawyers in ${city.name}`;
  const byPractice = filterLawyersByPractice(await getLawyers(), area);
  const filtered = filterLawyers(byPractice, { city: city.slug });

  return (
    <div>
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Cities', href: '/cities' },
              { label: city.name, href: `/city/${slug}` },
              { label: area.name },
            ]}
          />
          <h1 className="font-display text-4xl font-bold">{title}</h1>
          <p className="mt-2 text-slate-300">{city.state} · {area.lawyers.toLocaleString()}+ lawyers listed</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <p className="text-slate-600">
            No {area.name.toLowerCase()} lawyers in {city.name} yet.{' '}
            <Link href={`/city/${city.slug}`} className="font-semibold text-royal-600">
              Browse all lawyers in {city.name}
            </Link>
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
        )}
        <section className="mt-12 rounded-2xl border p-6 dark:border-navy-700">
          <h2 className="font-bold">FAQs — {title}</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold">How much does a consultation cost in {city.name}?</dt>
              <dd className="text-slate-600">Typically ₹500–₹5,000 depending on lawyer experience.</dd>
            </div>
            <div>
              <dt className="font-semibold">Are online consultations valid?</dt>
              <dd className="text-slate-600">Yes — initial consultations can be done via video or phone.</dd>
            </div>
          </dl>
        </section>
        <div className="mt-12"><InternalLinksBlock city={city.name} practice={area.name} /></div>
      </div>
    </div>
  );
}
