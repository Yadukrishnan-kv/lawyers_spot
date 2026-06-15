'use client';

import Link from 'next/link';
import { Scale } from 'lucide-react';
import { useCms } from '@/lib/cms/context';
import { resolveFooter } from '@/lib/footer-defaults';
import { practiceAreaPath } from '@/lib/practice-utils';

export function Footer() {
  const { practiceAreas, cities, siteConfig, siteContent } = useCms();
  const footer = resolveFooter(siteContent);
  const {
    courts,
    legalGuides,
    qaCategories,
    popularSearches,
    utilityNav,
  } = siteContent;

  const tagline = footer.brandTagline.trim() || siteConfig.description;
  const visibleCourts =
    footer.courtsListLimit > 0 ? courts.slice(0, footer.courtsListLimit) : courts;
  const visibleQa =
    footer.qaTopicsLimit > 0 ? qaCategories.slice(0, footer.qaTopicsLimit) : qaCategories;

  return (
    <footer className="border-t border-navy-800 bg-navy-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal-600">
                <Scale className="h-5 w-5" />
              </span>
              {siteConfig.name}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{tagline}</p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              {footer.sectionTitles.findByCity}
            </h3>
            <ul className="space-y-2 text-sm">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/city/${c.slug}`} className="hover:text-gold-400">
                    lawyers in {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={footer.findByCityAll.href} className="font-semibold text-royal-400">
                  {footer.findByCityAll.label}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              {footer.sectionTitles.practiceAreas}
            </h3>
            <ul className="space-y-2 text-sm">
              {practiceAreas.map((p) => (
                <li key={p.slug}>
                  <Link href={practiceAreaPath(p)} className="hover:text-gold-400">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              {footer.sectionTitles.courts}
            </h3>
            <ul className="space-y-2 text-sm">
              {visibleCourts.map((c) => (
                <li key={c.slug}>
                  <Link href={`/court/${c.slug}`} className="hover:text-gold-400">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={footer.courtsAll.href} className="font-semibold text-royal-400">
                  {footer.courtsAll.label}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              {footer.sectionTitles.quickLinks}
            </h3>
            <ul className="space-y-2 text-sm">
              {utilityNav.map((u) => (
                <li key={u.href}>
                  <Link href={u.href} className="hover:text-gold-400">
                    {u.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-white">
              {footer.sectionTitles.legalResources}
            </h3>
            <ul className="space-y-2 text-sm">
              {footer.legalResources.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="hover:text-gold-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-white">
              {footer.sectionTitles.qaTopics}
            </h3>
            <ul className="space-y-1 text-sm">
              {visibleQa.map((c) => (
                <li key={c.slug}>
                  <Link href={`/qa?category=${c.slug}`} className="hover:text-gold-400">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-navy-800 pt-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            {footer.sectionTitles.cityPractice}
          </h3>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {footer.cityPracticeLinks.map((link) => (
              <Link key={link.href + link.label} href={link.href} className="hover:text-gold-400">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            {footer.sectionTitles.popularSearches}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {popularSearches.map((s) => (
              <Link
                key={s.href + s.label}
                href={s.href}
                className="rounded-full border border-navy-700 px-3 py-1 hover:border-gold-500 hover:text-gold-400"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-navy-800 pt-6">
          <h3 className="text-sm font-bold text-white">{footer.sectionTitles.featuredGuides}</h3>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {legalGuides.map((g) => (
              <li key={g.slug}>
                <Link href={`/articles/${g.slug}`} className="hover:text-gold-400">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-navy-800 pt-8 text-sm sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {footer.bottomLinks.map((link) => (
              <Link key={link.href + link.label} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
