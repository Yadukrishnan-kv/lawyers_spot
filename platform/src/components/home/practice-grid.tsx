'use client';

import Link from 'next/link';
import * as Icons from 'lucide-react';
import { useCms } from '@/lib/cms/context';
import { practiceAreaPath } from '@/lib/practice-utils';

const iconMap: Record<string, keyof typeof Icons> = {
  HeartCrack: 'HeartCrack',
  Gavel: 'Gavel',
  Building2: 'Building2',
  Briefcase: 'Briefcase',
  Users: 'Users',
  Shield: 'Shield',
  Plane: 'Plane',
  Rocket: 'Rocket',
  Calculator: 'Calculator',
};

export function PracticeGrid() {
  const { practiceAreas } = useCms();

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-royal-600">Practice Areas</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-navy-900 dark:text-white md:text-4xl">
            Find the Right Legal Expert
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">SEO-optimized category hubs — scalable to thousands of practice × city pages.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {practiceAreas.map((area, i) => {
            const Icon = Icons[iconMap[area.icon] || 'Scale'] as React.ComponentType<{ className?: string }>;
            return (
              <div key={area.slug} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <Link
                  href={practiceAreaPath(area)}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-royal-500/30 hover:shadow-premium dark:border-navy-700 dark:bg-navy-800"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-royal-500/10 text-royal-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-navy-900 group-hover:text-royal-600 dark:text-white">
                    {area.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-slate-500">{area.lawyers.toLocaleString()}+ verified lawyers</p>
                  <span className="mt-4 text-sm font-semibold text-royal-600">Explore →</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
