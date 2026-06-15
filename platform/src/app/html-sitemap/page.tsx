import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { getPracticeAreas, getCities, getSiteContent } from '@/lib/data';
import { cityPracticeHref } from '@/lib/seo-nav';
import { practiceAreaPath } from '@/lib/practice-utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HTML Sitemap',
  description: 'Complete sitemap of LawyerSpot legal marketplace — lawyers, cities, courts, guides, Q&A.',
  alternates: { canonical: '/html-sitemap' },
};

export default async function HtmlSitemapPage() {
  const cities = await getCities();
  const practiceAreas = await getPracticeAreas();
  const { courts, legalGuides, qaCategories, popularSearches } = await getSiteContent();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Sitemap' }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">HTML Sitemap</h1>
      <p className="mt-2 text-slate-600">Internal link hub for crawlers and users — mirrors LawRato-style discoverability</p>

      <div className="mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        <section>
          <h2 className="font-bold text-royal-600">Main</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/lawyers">Find Lawyers</Link></li>
            <li><Link href="/qa">Legal Q&A</Link></li>
            <li><Link href="/guides">Law Guides</Link></li>
            <li><Link href="/ipc">IPC Sections</Link></li>
            <li><Link href="/bns">BNS Sections</Link></li>
            <li><Link href="/acts">Acts & Sections</Link></li>
            <li><Link href="/indian-kanoon">Indian Kanoon</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Use</Link></li>
            <li><Link href="/lawyer-signup">Lawyer Signup</Link></li>
            <li><Link href="/articles">Articles</Link></li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-royal-600">Cities</h2>
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-sm">
            {cities.map((c) => (
              <li key={c.slug}><Link href={`/city/${c.slug}`}>lawyers in {c.name}</Link></li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-royal-600">Practice Areas</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {practiceAreas.map((p) => (
              <li key={p.slug}><Link href={practiceAreaPath(p)}>{p.name}</Link></li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-royal-600">Courts</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {courts.map((c) => (
              <li key={c.slug}><Link href={`/court/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-royal-600">City × Practice (SEO)</h2>
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-sm">
            {cities.slice(0, 4).flatMap((city) =>
              practiceAreas.slice(0, 3).map((p) => (
                <li key={`${city.slug}-${p.slug}`}>
                  <Link href={cityPracticeHref(city.slug, p.slug)}>
                    {p.name.replace(' Law', '')} in {city.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-royal-600">Q&A Categories</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {qaCategories.map((c) => (
              <li key={c.slug}><Link href={`/qa?category=${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="font-bold">Popular Searches</h2>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {popularSearches.map((s) => (
            <Link key={s.href} href={s.href} className="text-royal-600 hover:underline">{s.label}</Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-bold">Law Guides</h2>
        <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          {legalGuides.map((g) => (
            <li key={g.slug}><Link href={`/articles/${g.slug}`}>{g.title}</Link></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
