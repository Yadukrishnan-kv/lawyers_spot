import type { FooterContent, NavLink, SiteContent } from '@/lib/cms/types';
import { cityPracticeHref } from '@/lib/seo-nav';

export const DEFAULT_LEGAL_RESOURCES: NavLink[] = [
  { label: 'IPC Sections', href: '/ipc' },
  { label: 'BNS Sections', href: '/bns' },
  { label: 'Legal Q&A (2.5M+)', href: '/qa' },
  { label: 'Law Guides', href: '/guides' },
  { label: 'Acts & Sections', href: '/acts' },
  { label: 'Articles', href: '/articles' },
  { label: 'HTML Sitemap', href: '/html-sitemap' },
];

export const DEFAULT_BOTTOM_LINKS: NavLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Sitemap', href: '/html-sitemap' },
  { label: 'For Lawyers', href: '/lawyer-dashboard' },
];

export function buildDefaultCityPracticeLinks(): NavLink[] {
  const cities = [
    { slug: 'bangalore', name: 'Bangalore' },
    { slug: 'chennai', name: 'Chennai' },
    { slug: 'delhi', name: 'Delhi' },
    { slug: 'hyderabad', name: 'Hyderabad' },
    { slug: 'kochi', name: 'Kochi' },
    { slug: 'kolkata', name: 'Kolkata' },
    { slug: 'mumbai', name: 'Mumbai' },
    { slug: 'pune', name: 'Pune' },
  ];
  const practices = [
    { slug: 'divorce', label: 'Divorce' },
    { slug: 'property', label: 'Property' },
    { slug: 'criminal', label: 'Criminal' },
  ];

  return cities.flatMap((city) =>
    practices.map((p) => ({
      label: `${p.label} lawyers in ${city.name}`,
      href: cityPracticeHref(city.slug, p.slug),
    })),
  );
}

export const DEFAULT_FOOTER: FooterContent = {
  brandTagline: '',
  sectionTitles: {
    findByCity: 'Find by City',
    practiceAreas: 'Practice Areas',
    courts: 'Courts',
    quickLinks: 'Quick Links',
    legalResources: 'Legal Resources',
    qaTopics: 'Q&A Topics',
    cityPractice: 'Popular: lawyers by City & Service',
    popularSearches: 'Popular Searches',
    featuredGuides: 'Featured Law Guides',
  },
  findByCityAll: { label: 'All cities →', href: '/cities' },
  courtsAll: { label: 'All courts →', href: '/courts' },
  courtsListLimit: 6,
  qaTopicsLimit: 4,
  legalResources: DEFAULT_LEGAL_RESOURCES,
  bottomLinks: DEFAULT_BOTTOM_LINKS,
  cityPracticeLinks: buildDefaultCityPracticeLinks(),
};

export function resolveFooter(sc: SiteContent): FooterContent {
  const f = sc.footer;
  return {
    ...DEFAULT_FOOTER,
    ...f,
    sectionTitles: { ...DEFAULT_FOOTER.sectionTitles, ...f?.sectionTitles },
    findByCityAll: { ...DEFAULT_FOOTER.findByCityAll, ...f?.findByCityAll },
    courtsAll: { ...DEFAULT_FOOTER.courtsAll, ...f?.courtsAll },
    legalResources: f?.legalResources?.length ? f.legalResources : DEFAULT_FOOTER.legalResources,
    bottomLinks: f?.bottomLinks?.length ? f.bottomLinks : DEFAULT_FOOTER.bottomLinks,
    cityPracticeLinks: f?.cityPracticeLinks?.length
      ? f.cityPracticeLinks
      : DEFAULT_FOOTER.cityPracticeLinks,
  };
}
