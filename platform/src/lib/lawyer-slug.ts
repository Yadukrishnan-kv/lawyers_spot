import type { Lawyer } from '@/lib/data-types';

/** SEO slug from advocate name */
export function slugifyName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/\badv\.?\b/g, '')
    .replace(/\badvocate\b/g, '')
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);

  if (!base) return 'lawyer';
  return base.startsWith('adv-') ? base : `adv-${base}`;
}

/** True if segment looks like a legacy numeric id */
export function isLegacyLawyerId(segment: string): boolean {
  return /^\d+$/.test(segment);
}

export function getLawyerSlug(lawyer: Pick<Lawyer, 'slug' | 'name' | 'id'>): string {
  const existing = lawyer.slug?.trim();
  if (existing && !isLegacyLawyerId(existing) && existing !== lawyer.id) {
    return existing;
  }
  return slugifyName(lawyer.name);
}

export function lawyerProfilePath(lawyer: Pick<Lawyer, 'slug' | 'name' | 'id'>): string {
  return `/lawyers/${getLawyerSlug(lawyer)}`;
}

/** Assign unique SEO slugs to all lawyers */
export function normalizeLawyerSlugs(lawyers: Lawyer[]): Lawyer[] {
  const seen = new Set<string>();
  return lawyers.map((lawyer) => {
    let slug = getLawyerSlug(lawyer);
    let n = 2;
    const base = slug;
    while (seen.has(slug)) {
      slug = `${base}-${n++}`;
    }
    seen.add(slug);
    return { ...lawyer, slug };
  });
}
