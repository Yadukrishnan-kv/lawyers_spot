'use client';

import { useCms } from '@/lib/cms/context';

export function StatsBar() {
  const { stats } = useCms();

  return (
    <section className="bg-navy-900 py-12 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4 sm:px-6 lg:px-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl font-extrabold text-gold-400 md:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
