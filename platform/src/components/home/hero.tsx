'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Search, Shield, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCms } from '@/lib/cms/context';

const HERO_SOURCES = ['/images/hero.jpg', '/images/hero.svg', '/images/hero.png'];

export function Hero() {
  const { practiceAreas, cities, siteContent, stats } = useCms();
  const { hero } = siteContent;
  const lawyerStat = stats.find((s) => s.label.toLowerCase().includes('lawyer'))?.value ?? '18,500+';
  const [imgSrc, setImgSrc] = useState(HERO_SOURCES[0]);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const handleImgError = () => {
    if (fallbackIndex < HERO_SOURCES.length - 1) {
      const next = fallbackIndex + 1;
      setFallbackIndex(next);
      setImgSrc(HERO_SOURCES[next]);
    }
  };

  const titleParts = hero.title.split(' ');
  const lastWord = titleParts.pop() ?? '';
  const titleLead = titleParts.join(' ');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-royal-500/10 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <div className="mb-6 flex flex-wrap gap-3">
            {hero.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700"
              >
                {badge.includes('Confidential') ? <Shield className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                {badge}
              </span>
            ))}
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl lg:text-6xl dark:text-white">
            {titleLead}{' '}
            <span className="text-gradient">{lastWord}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-400">{hero.subtitle}</p>

          <div className="glass mt-8 rounded-2xl p-4 shadow-premium sm:p-5">
            <form action="/lawyers" className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Search lawyers</label>
                <input
                  name="q"
                  placeholder="Name or specialization"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20 dark:border-navy-700 dark:bg-navy-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">City</label>
                <select name="city" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value="">All Cities</option>
                  {cities.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Practice Area</label>
                <select name="practice" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value="">All Areas</option>
                  {practiceAreas.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="lg" className="sm:col-span-3">
                <Search className="h-5 w-5" /> Find My Lawyer
              </Button>
            </form>
            <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
              <Users className="h-3.5 w-3.5 text-emerald-500" />
              <strong>{lawyerStat}</strong> lawyers on LawyerSpot
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/lawyers">Talk to a Lawyer</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/qa">Ask Free Question</Link>
            </Button>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative aspect-[7/6] w-full overflow-hidden rounded-3xl bg-slate-200 shadow-premium dark:bg-navy-800">
            <Image
              src={imgSrc}
              alt="Professional legal consultation"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 0vw, 50vw"
              priority
              onError={handleImgError}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
