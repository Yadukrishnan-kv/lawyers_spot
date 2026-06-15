import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { InternalLinksBlock } from '@/components/seo/internal-links';
import { LawyerCard } from '@/components/lawyer/lawyer-card';
import { getPracticeBySlug, getLawyers, getArticles, getCities, getPracticeAreas } from '@/lib/data';
import {
  filterLawyersByPractice,
  practiceAreaPath,
  practiceSeoSlug,
  resolvePracticeFromParam,
} from '@/lib/practice-utils';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const areas = await getPracticeAreas();
  return areas.map((p) => ({ slug: practiceSeoSlug(p) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const practice = await getPracticeBySlug(slug);
  if (!practice) return { title: 'Practice Area', robots: { index: false } };
  const canonical = practiceAreaPath(practice);
  return {
    title: `${practice.name} Lawyers in India`,
    description: `Find ${practice.lawyers}+ verified ${practice.name} lawyers. Book consultations, read guides & FAQs.`,
    alternates: { canonical },
  };
}

export default async function PracticePage({ params }: Props) {
  const { slug: param } = await params;
  const practiceAreas = await getPracticeAreas();
  const practice = resolvePracticeFromParam(param, practiceAreas);
  if (!practice) notFound();

  const canonicalSlug = practiceSeoSlug(practice);
  if (param !== canonicalSlug) {
    permanentRedirect(practiceAreaPath(practice));
  }

  const areaLawyers = filterLawyersByPractice(await getLawyers(), practice);
  const articles = await getArticles();
  const cities = await getCities();

  return (
    <div>
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: practice.name }]} />
          <h1 className="font-display text-4xl font-bold">{practice.name}</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            {areaLawyers.length > 0
              ? `${areaLawyers.length} verified lawyers · Guides · Q&A · Consultations`
              : `${practice.lawyers.toLocaleString()}+ lawyers on LawyerSpot · Refine search below`}
          </p>
          <Button variant="gold" className="mt-6" asChild>
            <Link href={`/lawyers?practice=${practice.slug}`}>Find a {practice.name} Lawyer</Link>
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold">Top {practice.name} Lawyers</h2>
        {areaLawyers.length === 0 ? (
          <p className="mt-6 text-slate-600">
            No lawyers in this category yet.{' '}
            <Link href="/lawyers" className="font-semibold text-royal-600">
              Browse all lawyers
            </Link>{' '}
            or check related practice areas below.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {areaLawyers.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
        )}
        <section className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border p-6 dark:border-navy-700">
            <h2 className="font-bold">FAQs</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-semibold">How do I choose the right lawyer?</dt>
                <dd className="text-slate-600">Compare ratings, experience and consultation fees on LawyerSpot.</dd>
              </div>
              <div>
                <dt className="font-semibold">Is consultation confidential?</dt>
                <dd className="text-slate-600">Yes — attorney-client privilege applies to all sessions.</dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="font-bold">Related Articles</h2>
            <ul className="mt-4 space-y-2">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/articles/${a.slug}`} className="text-royal-600 hover:underline">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="mt-12">
          <h2 className="font-bold">By City</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/city/${c.slug}/${practice.slug}`}
                className="rounded-full border px-4 py-2 text-sm hover:border-royal-500"
              >
                {practice.name} in {c.name}
              </Link>
            ))}
          </div>
        </section>
        <div className="mt-12">
          <InternalLinksBlock practice={practice.name} />
        </div>
      </div>
    </div>
  );
}
