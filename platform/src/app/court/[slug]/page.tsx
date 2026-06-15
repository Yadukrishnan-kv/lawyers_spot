import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { InternalLinksBlock } from '@/components/seo/internal-links';
import { LawyerCard } from '@/components/lawyer/lawyer-card';
import { Button } from '@/components/ui/button';
import { getLawyers, getPracticeAreas, getSiteContent } from '@/lib/data';
import { filterLawyersByCourt } from '@/lib/court-utils';
import { practiceAreaPath } from '@/lib/practice-utils';
import { sanitizeCmsHtml } from '@/lib/security/sanitize-html';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { courts } = await getSiteContent();
  return courts.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { courts } = await getSiteContent();
  const court = courts.find((c) => c.slug === slug);
  if (!court) return { title: 'Court' };
  return {
    title: court.metaTitle ?? `Lawyers for ${court.name}`,
    description:
      court.metaDescription ??
      `Find advocates practicing in ${court.name}. Book consultations online.`,
  };
}

export default async function CourtPage({ params }: Props) {
  const { slug } = await params;
  const { courts } = await getSiteContent();
  const court = courts.find((c) => c.slug === slug);
  if (!court) notFound();

  const allLawyers = await getLawyers();
  const lawyers = filterLawyersByCourt(allLawyers, court);
  const practiceAreas = await getPracticeAreas();

  const bodyHtml =
    court.body ??
    `<p>Find experienced advocates practicing before the <strong>${court.name}</strong> in ${court.city}.</p>`;

  return (
    <div>
      <div className="bg-navy-900 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Courts', href: '/courts' },
              { label: court.name },
            ]}
          />
          <h1 className="font-display text-4xl font-bold">Lawyers — {court.name}</h1>
          <p className="mt-2 text-slate-300">
            {court.city} · Verified advocates · Book online
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          className="prose-legal mb-10 max-w-3xl text-slate-600"
          dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(bodyHtml) }}
        />

        {lawyers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lawyers.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-navy-700 dark:bg-navy-900">
            <p className="text-slate-600 dark:text-slate-400">
              No lawyers are listed for {court.name} yet. Browse all advocates or add court practice
              in the admin panel.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/lawyers">Browse all lawyers</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/courts">All courts</Link>
              </Button>
            </div>
          </div>
        )}

        <section className="mt-12">
          <h2 className="font-bold text-navy-900 dark:text-white">Related practice areas</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {practiceAreas.map((p) => (
              <Link
                key={p.slug}
                href={practiceAreaPath(p)}
                className="rounded-full border px-4 py-2 text-sm hover:border-royal-500"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </section>
        <div className="mt-12">
          <InternalLinksBlock />
        </div>
      </div>
    </div>
  );
}
