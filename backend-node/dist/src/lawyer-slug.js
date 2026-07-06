export function slugifyName(name) {
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
    if (!base)
        return 'lawyer';
    return base.startsWith('adv-') ? base : `adv-${base}`;
}
export function getLawyerSlug(lawyer) {
    const existing = lawyer.slug?.trim();
    if (existing && !/^\d+$/.test(existing) && existing !== lawyer.id) {
        return existing;
    }
    return slugifyName(lawyer.name);
}
export function normalizeLawyerSlugs(lawyers) {
    const seen = new Set();
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
