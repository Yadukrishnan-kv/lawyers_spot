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

export function getLawyerSlug(lawyer: { slug?: string | null; name: string; id: string }): string {
  const existing = lawyer.slug?.trim();
  if (existing && !/^\d+$/.test(existing) && existing !== lawyer.id) {
    return existing;
  }
  return slugifyName(lawyer.name);
}

export function normalizeLawyerSlugs<T extends { slug?: string | null; name: string; id: string }>(
  lawyers: T[],
): (T & { slug: string })[] {
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
