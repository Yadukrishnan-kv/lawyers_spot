import type { Lawyer } from '@/lib/data-types';
import type { PracticeArea } from '@/lib/cms/types';

/** SEO URL segment from practice name, e.g. "Corporate Law" → "corporate-law" */
export function practiceSeoSlug(practice: Pick<PracticeArea, 'slug' | 'name'>): string {
  const fromName = practice.name
    .toLowerCase()
    .replace(/\s*&\s*/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return fromName || practice.slug;
}

export function practiceAreaPath(practice: Pick<PracticeArea, 'slug' | 'name'>): string {
  return `/practice/${practiceSeoSlug(practice)}`;
}

/** Resolve practice from URL param (supports corporate-law, corporate, divorce, etc.) */
export function resolvePracticeFromParam(
  param: string,
  practiceAreas: PracticeArea[],
): PracticeArea | undefined {
  const key = param.toLowerCase().trim();
  const withoutLaw = key.replace(/-law$/, '');

  return practiceAreas.find((p) => {
    const slug = p.slug.toLowerCase();
    const seo = practiceSeoSlug(p);
    return slug === key || seo === key || slug === withoutLaw || seo === withoutLaw;
  });
}

/** Lawyer.practice keys that belong to a practice area (e.g. divorce → family) */
const PRACTICE_ALIASES: Record<string, string[]> = {
  family: ['family', 'divorce'],
  divorce: ['family', 'divorce'],
  tax: ['tax', 'gst'],
  corporate: ['corporate'],
  criminal: ['criminal'],
  property: ['property'],
  cyber: ['cyber'],
  immigration: ['immigration'],
  startup: ['startup'],
};

export function lawyerMatchesPractice(lawyer: Lawyer, practice: PracticeArea): boolean {
  const practiceKey = lawyer.practice.toLowerCase();
  const keys = PRACTICE_ALIASES[practice.slug] ?? [practice.slug];
  if (keys.includes(practiceKey)) return true;

  const nameWords = practice.name
    .toLowerCase()
    .replace(/\s*&\s*/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && w !== 'law');

  const specs = (lawyer.specialization ?? []).map((s) => s.toLowerCase());
  if (specs.some((s) => nameWords.some((w) => s.includes(w)))) return true;

  const hay = [lawyer.bio ?? '', lawyer.firm ?? ''].join(' ').toLowerCase();
  return nameWords.some((w) => hay.includes(w));
}

export function filterLawyersByPractice(lawyers: Lawyer[], practice: PracticeArea): Lawyer[] {
  return lawyers.filter((l) => lawyerMatchesPractice(l, practice));
}
