'use client';

import Link from 'next/link';
import { MapPin, Gavel, Search, BookOpen, MessageCircle } from 'lucide-react';
import { useCms } from '@/lib/cms/context';
import { cityPracticeHref } from '@/lib/seo-nav';

export function SeoBrowseSections() {
  const { practiceAreas, cities, siteContent } = useCms();
  const { courts, popularSearches, legalGuides } = siteContent;

  return (
    <>
      {/* Find lawyers by City */}
      <section className="border-t border-slate-200 bg-white py-16 dark:border-navy-800 dark:bg-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-royal-600" />
            <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Find lawyers by City</h2>
          </div>
          <p className="mt-2 text-slate-600">1,200+ cities — each with dedicated SEO landing pages</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
            {cities.map((city) => (
              <div key={city.slug} className="rounded-xl border border-slate-200 p-4 dark:border-navy-700">
                <Link href={`/city/${city.slug}`} className="font-semibold text-royal-600 hover:underline">
                  lawyers in {city.name}
                </Link>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {practiceAreas.slice(0, 4).map((p) => (
                    <li key={p.slug}>
                      <Link href={cityPracticeHref(city.slug, p.slug)} className="hover:text-royal-600">
                        {p.name.replace(' Law', '')} lawyers
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link href="/cities" className="mt-6 inline-block text-sm font-semibold text-royal-600">View all cities →</Link>
        </div>
      </section>

      {/* Find lawyers by Court */}
      <section className="bg-slate-50 py-16 dark:bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Gavel className="h-6 w-6 text-royal-600" />
            <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Find lawyers by Court</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {courts.map((court) => (
              <Link
                key={court.slug}
                href={`/court/${court.slug}`}
                className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-royal-500 hover:shadow-soft dark:border-navy-700 dark:bg-navy-800"
              >
                <p className="font-semibold text-navy-900 dark:text-white">{court.name}</p>
                <p className="mt-1 text-xs text-slate-500">{court.city}</p>
              </Link>
            ))}
          </div>
          <Link href="/courts" className="mt-6 inline-block text-sm font-semibold text-royal-600">Browse all courts →</Link>
        </div>
      </section>

      {/* Popular Searches */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Search className="h-6 w-6 text-royal-600" />
            <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Popular Legal Searches</h2>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {popularSearches.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:border-royal-500 hover:text-royal-600 dark:border-navy-700 dark:bg-navy-800"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Law Guides */}
      <section className="border-t bg-white py-16 dark:bg-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-royal-600" />
                <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Popular Law Guides</h2>
              </div>
              <ul className="mt-6 space-y-3">
                {legalGuides.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/articles/${g.slug}`} className="group flex gap-3 rounded-xl border border-slate-200 p-4 hover:border-royal-500 dark:border-navy-700">
                      <span className="text-xs font-bold text-royal-600">{g.category}</span>
                      <span className="font-medium group-hover:text-royal-600">{g.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/guides" className="mt-4 inline-block text-sm font-semibold text-royal-600">All law guides →</Link>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-royal-600" />
                <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Free Legal Advice Topics</h2>
              </div>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {['Divorce & Alimony', 'Property Disputes', 'Cheque Bounce', 'GST & Tax', 'Employment Issues', 'Cyber Crime'].map((topic) => (
                  <li key={topic}>
                    <Link href={`/qa?q=${encodeURIComponent(topic)}`} className="block rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium hover:border-royal-500 dark:border-navy-700">
                      {topic}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/qa" className="mt-4 inline-block text-sm font-semibold text-royal-600">Browse all Q&A →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
