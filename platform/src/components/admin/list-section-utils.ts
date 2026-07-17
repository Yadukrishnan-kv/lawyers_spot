import type { CmsData } from '@/lib/cms/types';
import { defaultCityState } from '@/components/admin/state-select-options';

export type ListSection = 'practiceAreas' | 'states' | 'cities' | 'qaPosts' | 'articles';

const now = () => new Date().toISOString();

export function makeDefaultItem(section: ListSection, cms: CmsData): Record<string, unknown> {
  const ts = Date.now();
  switch (section) {
    case 'practiceAreas':
      return { slug: `area-${ts}`, name: 'New Area', icon: 'Gavel', lawyers: 0, createdAt: now() };
    case 'states':
      return { slug: `state-${ts}`, name: 'New State', code: 'XX', active: true, createdAt: now() };
    case 'cities':
      return { slug: `city-${ts}`, name: 'New City', state: defaultCityState(cms), createdAt: now() };
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
        createdAt: now(),
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
        image: '',
        trending: false,
        status: 'published',
        createdAt: now(),
      };
  }
}
