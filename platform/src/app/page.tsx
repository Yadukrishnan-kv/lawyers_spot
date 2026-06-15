import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/home/hero';
import { getSiteConfig } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    alternates: { canonical: '/' },
  };
}
import { StatsBar } from '@/components/home/stats-bar';
import { PracticeGrid } from '@/components/home/practice-grid';
import { SeoBrowseSections } from '@/components/home/seo-browse-sections';
import { LawyerCard } from '@/components/lawyer/lawyer-card';
import { Button } from '@/components/ui/button';
import { getTopRatedLawyers, getQaPosts, getArticles } from '@/lib/data';
import Image from 'next/image';

export default async function HomePage() {
  const [topRatedLawyers, qaPosts, articles] = await Promise.all([
    getTopRatedLawyers(4),
    getQaPosts(),
    getArticles(),
  ]);

  return (
    <>
      <Hero />
      <StatsBar />
      <PracticeGrid />

      {/* Top rated lawyers */}
      <section className="bg-white py-20 dark:bg-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-royal-600">Top Rated</p>
              <h2 className="font-display text-3xl font-bold text-navy-900 dark:text-white">Top Rated Lawyers</h2>
            </div>
            <Button variant="secondary" asChild><Link href="/lawyers?sort=rating">View all</Link></Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {topRatedLawyers.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
        </div>
      </section>

      {/* Legal Q&A */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-royal-600">Community</p>
              <h2 className="font-display text-3xl font-bold text-navy-900 dark:text-white">Latest Legal Answers</h2>
            </div>
            <Button asChild><Link href="/qa">Ask a Question</Link></Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {qaPosts.map((q) => (
              <Link
                key={q.id}
                href={`/qa/${q.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-soft dark:border-navy-700 dark:bg-navy-800"
              >
                <span className="text-xs font-semibold text-royal-600">{q.category}</span>
                <h3 className="mt-2 font-semibold text-navy-900 dark:text-white">{q.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{q.excerpt}</p>
                <p className="mt-4 text-xs text-slate-400">{q.answers} answers · {q.views.toLocaleString()} views</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="bg-slate-50 py-20 dark:bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-navy-900 dark:text-white">Legal Guides & Articles</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {articles.map((a) => (
              <Link key={a.slug} href={`/articles/${a.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-navy-700 dark:bg-navy-800">
                <div className="relative h-48">
                  <Image src={a.image} alt="" fill className="object-cover transition group-hover:scale-105" sizes="33vw" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-bold text-royal-600">{a.category}</span>
                  <h3 className="mt-2 font-bold text-navy-900 group-hover:text-royal-600 dark:text-white">{a.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{a.readTime} read</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SeoBrowseSections />

      {/* App CTA */}
      <section className="mx-4 mb-20 sm:mx-6 lg:mx-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-800 p-10 text-white lg:p-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold">Legal help in your pocket</h2>
              <p className="mt-4 text-slate-300">Book lawyers, track cases, browse 2.5M+ answers — iOS & Android.</p>
              <div className="mt-6 flex gap-4">
                <Button variant="gold">App Store</Button>
                <Button variant="secondary" className="border-white/20 text-white">Google Play</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
