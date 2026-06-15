'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, MapPin, Gavel, Scale } from 'lucide-react';
import { useCms } from '@/lib/cms/context';
import { cityPracticeHref } from '@/lib/seo-nav';
import { practiceAreaPath } from '@/lib/practice-utils';
import { cn } from '@/lib/utils';

export type MegaMenuId = 'lawyers' | 'advice' | null;

/** Nav triggers only — panels render full-width in Header */
export function MegaNavTriggers({
  open,
  setOpen,
}: {
  open: MegaMenuId;
  setOpen: (id: MegaMenuId) => void;
}) {
  return (
    <nav className="flex items-center">
      <div
        className={cn(
          'flex items-center gap-0.5 whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide transition',
          open === 'lawyers' ? 'text-royal-600' : 'text-slate-700 hover:text-royal-600 dark:text-slate-200'
        )}
        onMouseEnter={() => setOpen('lawyers')}
        role="button"
        tabIndex={0}
        aria-expanded={open === 'lawyers'}
      >
        <Link href="/lawyers">Find A Lawyer</Link>
        <ChevronDown className={cn('h-3.5 w-3.5 opacity-60 transition', open === 'lawyers' && 'rotate-180')} />
      </div>

      <div
        className={cn(
          'flex items-center gap-0.5 whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide transition',
          open === 'advice' ? 'text-royal-600' : 'text-slate-700 hover:text-royal-600 dark:text-slate-200'
        )}
        onMouseEnter={() => setOpen('advice')}
        role="button"
        tabIndex={0}
        aria-expanded={open === 'advice'}
      >
        <Link href="/qa">Legal Advice</Link>
        <ChevronDown className={cn('h-3.5 w-3.5 opacity-60 transition', open === 'advice' && 'rotate-180')} />
      </div>
    </nav>
  );
}

/** Full-width mega panel — spans viewport, content centered in max-w-7xl */
export function MegaMenuPanel({ open }: { open: MegaMenuId }) {
  const { practiceAreas, cities, siteContent } = useCms();
  const { courts, qaCategories } = siteContent;
  if (!open) return null;

  if (open === 'lawyers') {
    return (
      <div className="absolute left-0 right-0 top-full z-50 border-t border-slate-200 bg-white shadow-premium dark:border-navy-700 dark:bg-navy-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-royal-600">
                <Scale className="h-4 w-4" /> By Practice Area
              </p>
              <ul className="grid gap-0.5 sm:grid-cols-2 md:grid-cols-1">
                {practiceAreas.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={practiceAreaPath(p)}
                      className="block rounded-lg px-2 py-1.5 text-sm hover:bg-royal-50 hover:text-royal-600 dark:hover:bg-navy-800"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/lawyers" className="mt-3 inline-block text-xs font-semibold text-royal-600">
                View all lawyers →
              </Link>
            </div>
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-royal-600">
                <MapPin className="h-4 w-4" /> By City
              </p>
              <ul className="grid grid-cols-2 gap-0.5">
                {cities.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/city/${c.slug}`}
                      className="block rounded-lg px-2 py-1.5 text-sm hover:bg-royal-50 hover:text-royal-600 dark:hover:bg-navy-800"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/cities" className="mt-3 inline-block text-xs font-semibold text-royal-600">
                All cities →
              </Link>
            </div>
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-royal-600">
                <Gavel className="h-4 w-4" /> By Court
              </p>
              <ul className="grid gap-0.5">
                {courts.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/court/${c.slug}`}
                      className="block rounded-lg px-2 py-1.5 text-sm hover:bg-royal-50 hover:text-royal-600 dark:hover:bg-navy-800"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/courts" className="mt-3 inline-block text-xs font-semibold text-royal-600">
                All courts →
              </Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-navy-700">
            <span className="w-full text-xs font-bold uppercase text-slate-400">Popular searches</span>
            {cities.slice(0, 3).flatMap((city) =>
              ['divorce', 'property', 'criminal'].map((pr) => (
                <Link
                  key={`${city.slug}-${pr}`}
                  href={cityPracticeHref(city.slug, pr)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium hover:border-royal-500 hover:text-royal-600 dark:border-navy-600"
                >
                  {pr} lawyers in {city.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-0 right-0 top-full z-50 border-t border-slate-200 bg-white shadow-premium dark:border-navy-700 dark:bg-navy-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Link href="/qa" className="text-base font-semibold text-royal-600 hover:underline">
            Browse 2.5M+ Legal Answers →
          </Link>
          <ul className="mt-4 grid gap-1 sm:grid-cols-2">
            {qaCategories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/qa?category=${cat.slug}`}
                  className="flex justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-navy-800"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-slate-400">{cat.count.toLocaleString()}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-4 dark:border-navy-700">
            <Link
              href="/qa/ask"
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold uppercase text-white hover:bg-emerald-700"
            >
              Ask A Free Question
            </Link>
            <Link
              href="/guides"
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-xs font-bold uppercase hover:border-royal-500 dark:border-navy-600"
            >
              Law Guides
            </Link>
            <Link href="/qa" className="rounded-lg px-5 py-2.5 text-xs font-bold uppercase text-royal-600">
              Free Legal Advice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use MegaNavTriggers — kept for any old imports */
export function MegaNav() {
  const [open, setOpen] = useState<MegaMenuId>(null);
  return (
    <div className="relative" onMouseLeave={() => setOpen(null)}>
      <MegaNavTriggers open={open} setOpen={setOpen} />
      <MegaMenuPanel open={open} />
    </div>
  );
}

export function MobileSeoNav({ onNavigate }: { onNavigate?: () => void }) {
  const { practiceAreas, cities, siteContent } = useCms();
  const { courts } = siteContent;
  const [section, setSection] = useState<string | null>(null);

  return (
    <div className="border-t p-4">
      <p className="px-2 text-[10px] font-bold uppercase text-slate-400">Browse</p>
      {(['cities', 'courts', 'practice'] as const).map((id) => (
        <div key={id} className="border-b border-slate-100 dark:border-navy-800">
          <button
            type="button"
            className="flex w-full items-center justify-between py-3 text-sm font-semibold capitalize"
            onClick={() => setSection(section === id ? null : id)}
          >
            {id}
            <ChevronDown className={cn('h-4 w-4', section === id && 'rotate-180')} />
          </button>
          {section === id && id === 'cities' && (
            <div className="pb-3 pl-2 text-sm">
              {cities.map((c) => (
                <Link key={c.slug} href={`/city/${c.slug}`} onClick={onNavigate} className="block py-1">
                  {c.name}
                </Link>
              ))}
            </div>
          )}
          {section === id && id === 'courts' && (
            <div className="pb-3 pl-2 text-sm">
              {courts.map((c) => (
                <Link key={c.slug} href={`/court/${c.slug}`} onClick={onNavigate} className="block py-1">
                  {c.name}
                </Link>
              ))}
            </div>
          )}
          {section === id && id === 'practice' && (
            <div className="pb-3 pl-2 text-sm">
              {practiceAreas.map((p) => (
                <Link key={p.slug} href={practiceAreaPath(p)} onClick={onNavigate} className="block py-1">
                  {p.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
