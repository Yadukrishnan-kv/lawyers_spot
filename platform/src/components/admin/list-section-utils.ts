import type { CmsData } from '@/lib/cms/types';
import { defaultCityState } from '@/components/admin/state-select-options';

export type ListSection = 'practiceAreas' | 'states' | 'cities' | 'qaPosts' | 'articles';

export function makeDefaultItem(section: ListSection, cms: CmsData): Record<string, unknown> {
  const ts = Date.now();
  switch (section) {
    case 'practiceAreas':
      return { slug: `area-${ts}`, name: 'New Area', icon: 'Gavel', lawyers: 0 };
    case 'states':
      return { slug: `state-${ts}`, name: 'New State', code: 'XX', active: true };
    case 'cities':
      return { slug: `city-${ts}`, name: 'New City', state: defaultCityState(cms) };
    case 'qaPosts':
      return {
        id: String(ts),
        title: 'New legal question',
        excerpt: '',
        category: 'General',
        answers: 0,
        views: 0,
        slug: `qa-${ts}`,
        status: 'published',
      };
    case 'articles':
      return {
        slug: `article-${ts}`,
        title: 'New Article',
        excerpt: '',
        category: 'General',
        author: 'Legal Team',
        date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: '5 min',
        image: 'https://images.unsplash.com/photo-1589829545855-d10d557cf95f?w=800&h=500&fit=crop',
        trending: false,
        status: 'published',
      };
  }
}
