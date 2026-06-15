import type { CmsData } from '@/lib/cms/types';
import type { Lawyer, SubscriptionPlan } from '@/lib/data-types';
import { lawyerHasPrioritySearch } from '@/lib/subscription-features';
import { lawyerProfilePath } from '@/lib/lawyer-slug';

export type SearchResult = {
  type: 'lawyer' | 'article' | 'qa' | 'act' | 'court' | 'guide';
  title: string;
  excerpt: string;
  href: string;
};

function norm(s: string) {
  return s.toLowerCase().trim();
}

export function filterLawyers(
  lawyers: Lawyer[],
  opts: { q?: string; city?: string; practice?: string; sort?: string },
  plans: SubscriptionPlan[] = [],
): Lawyer[] {
  let list = [...lawyers];
  const q = norm(opts.q ?? '');

  if (opts.city) {
    const city = norm(opts.city);
    list = list.filter(
      (l) =>
        l.citySlug === city ||
        norm(l.location).includes(city) ||
        norm(l.location).includes(city.replace(/-/g, ' ')),
    );
  }

  if (opts.practice) {
    const practiceKey = norm(opts.practice).replace(/-law$/, '');
    list = list.filter(
      (l) =>
        l.practice === practiceKey ||
        norm(l.practice) === practiceKey ||
        norm(l.practice).includes(practiceKey) ||
        (l.specialization ?? []).some((s) => norm(s).includes(practiceKey)),
    );
  }

  if (q) {
    list = list.filter((l) => {
      const hay = [
        l.name,
        l.location,
        l.practice,
        l.firm ?? '',
        l.bio ?? '',
        ...(l.specialization ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  const priorityBoost = (l: Lawyer) => (plans.length && lawyerHasPrioritySearch(l, plans) ? 1 : 0);

  switch (opts.sort) {
    case 'experience':
      list.sort((a, b) => b.experience - a.experience);
      break;
    case 'fee':
      list.sort((a, b) => (a.fee ?? 999999) - (b.fee ?? 999999));
      break;
    default:
      list.sort((a, b) => {
        const boost = priorityBoost(b) - priorityBoost(a);
        if (boost !== 0) return boost;
        return b.rating - a.rating || b.reviews - a.reviews;
      });
  }

  return list;
}

export function searchSite(cms: CmsData, query: string, limit = 40): SearchResult[] {
  const q = norm(query);
  if (!q) return [];

  const results: SearchResult[] = [];
  const push = (r: SearchResult) => {
    if (results.length < limit) results.push(r);
  };

  for (const l of cms.lawyers) {
    const hay = [l.name, l.location, l.practice, l.bio ?? '', ...(l.specialization ?? [])].join(' ').toLowerCase();
    if (hay.includes(q)) {
      push({
        type: 'lawyer',
        title: l.name,
        excerpt: `${l.practice} · ${l.location}`,
        href: lawyerProfilePath(l),
      });
    }
  }

  for (const a of cms.articles.filter((x) => x.status !== 'draft')) {
    const hay = [a.title, a.excerpt, a.category, a.content ?? ''].join(' ').toLowerCase();
    if (hay.includes(q)) {
      push({ type: 'article', title: a.title, excerpt: a.excerpt, href: `/articles/${a.slug}` });
    }
  }

  for (const p of cms.qaPosts.filter((x) => x.status !== 'draft')) {
    const hay = [p.title, p.excerpt, p.category, p.content ?? ''].join(' ').toLowerCase();
    if (hay.includes(q)) {
      push({ type: 'qa', title: p.title, excerpt: p.excerpt, href: `/qa/${p.slug}` });
    }
  }

  for (const a of cms.siteContent.acts) {
    if ([a.title, a.act, a.body ?? ''].join(' ').toLowerCase().includes(q)) {
      push({ type: 'act', title: a.title, excerpt: a.act, href: `/acts/${a.slug}` });
    }
  }

  for (const c of cms.siteContent.courts) {
    if ([c.name, c.city, c.body ?? ''].join(' ').toLowerCase().includes(q)) {
      push({ type: 'court', title: c.name, excerpt: c.city, href: `/court/${c.slug}` });
    }
  }

  for (const g of cms.siteContent.legalGuides) {
    if ([g.title, g.category].join(' ').toLowerCase().includes(q)) {
      push({ type: 'guide', title: g.title, excerpt: g.category, href: `/articles/${g.slug}` });
    }
  }

  return results;
}
