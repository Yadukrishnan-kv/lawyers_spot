import type { CmsPageFields, CustomCmsPage, LegalListingPage, SiteContent } from '@/lib/cms/types';
import {
  DEFAULT_ABOUT_PAGE,
  DEFAULT_BNS_PAGE,
  DEFAULT_IPC_PAGE,
  DEFAULT_PRIVACY_PAGE,
  DEFAULT_TERMS_PAGE,
} from '@/lib/site-page-content';

export type CmsPageKind = 'static' | 'legal-listing' | 'custom';

export type SystemCmsPageDef = {
  id: string;
  slug: string;
  label: string;
  kind: 'static' | 'legal-listing';
  staticKey?: 'about' | 'termsPage' | 'privacyPage';
  listingKey?: 'ipcPage' | 'bnsPage';
  sectionsKey?: 'ipcSections' | 'bnsSections';
};

export const SYSTEM_CMS_PAGES: SystemCmsPageDef[] = [
  { id: 'about', slug: 'about', label: 'About', kind: 'static', staticKey: 'about' },
  { id: 'terms', slug: 'terms', label: 'Terms of Use', kind: 'static', staticKey: 'termsPage' },
  { id: 'privacy', slug: 'privacy', label: 'Privacy Policy', kind: 'static', staticKey: 'privacyPage' },
  { id: 'ipc', slug: 'ipc', label: 'IPC Sections', kind: 'legal-listing', listingKey: 'ipcPage', sectionsKey: 'ipcSections' },
  { id: 'bns', slug: 'bns', label: 'BNS Sections', kind: 'legal-listing', listingKey: 'bnsPage', sectionsKey: 'bnsSections' },
];

export type CmsPageListRow = {
  id: string;
  title: string;
  slug: string;
  path: string;
  kind: CmsPageKind;
  metaTitle: string;
  system: boolean;
};

const STATIC_DEFAULTS: Record<string, CmsPageFields> = {
  about: DEFAULT_ABOUT_PAGE,
  termsPage: DEFAULT_TERMS_PAGE,
  privacyPage: DEFAULT_PRIVACY_PAGE,
};

const LISTING_DEFAULTS: Record<string, LegalListingPage> = {
  ipcPage: DEFAULT_IPC_PAGE,
  bnsPage: DEFAULT_BNS_PAGE,
};

export function customCmsPages(siteContent: SiteContent): CustomCmsPage[] {
  return siteContent.customCmsPages ?? [];
}

export function publicPathForPage(slug: string, kind: CmsPageKind): string {
  return kind === 'custom' ? `/pages/${slug}` : `/${slug}`;
}

export function listCmsPages(siteContent: SiteContent): CmsPageListRow[] {
  const systemRows: CmsPageListRow[] = SYSTEM_CMS_PAGES.map((def) => {
    if (def.kind === 'static' && def.staticKey) {
      const page = { ...STATIC_DEFAULTS[def.staticKey], ...siteContent[def.staticKey] } as CmsPageFields;
      return {
        id: def.id,
        title: page.title || def.label,
        slug: def.slug,
        path: publicPathForPage(def.slug, 'static'),
        kind: 'static',
        metaTitle: page.metaTitle ?? page.title ?? def.label,
        system: true,
      };
    }
    const listing = {
      ...LISTING_DEFAULTS[def.listingKey!],
      ...siteContent[def.listingKey!],
    } as LegalListingPage;
    return {
      id: def.id,
      title: listing.title || def.label,
      slug: def.slug,
      path: publicPathForPage(def.slug, 'legal-listing'),
      kind: 'legal-listing',
      metaTitle: listing.metaTitle ?? listing.title ?? def.label,
      system: true,
    };
  });

  const customRows: CmsPageListRow[] = customCmsPages(siteContent)
    .filter((p) => p.active !== false)
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      path: publicPathForPage(p.slug, 'custom'),
      kind: 'custom',
      metaTitle: p.metaTitle ?? p.title,
      system: false,
    }));

  return [...systemRows, ...customRows];
}

export function findSystemPageDef(id: string): SystemCmsPageDef | undefined {
  return SYSTEM_CMS_PAGES.find((p) => p.id === id);
}

export function findCustomPage(siteContent: SiteContent, id: string): CustomCmsPage | undefined {
  return customCmsPages(siteContent).find((p) => p.id === id);
}

export function findCmsPageRow(siteContent: SiteContent, id: string): CmsPageListRow | undefined {
  return listCmsPages(siteContent).find((p) => p.id === id);
}

export function slugifyCmsPageSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'new-page';
}

export function newCustomCmsPage(): CustomCmsPage {
  const id = `cms-page-${Date.now()}`;
  return {
    id,
    slug: `page-${id.slice(-6)}`,
    title: 'New Page',
    body: '<p>Enter page content here.</p>',
    metaTitle: 'New Page',
    metaDescription: '',
    lastUpdated: '',
    active: true,
  };
}

export function resolveCustomCmsPageBySlug(
  siteContent: SiteContent,
  slug: string,
): CustomCmsPage | undefined {
  return customCmsPages(siteContent).find((p) => p.slug === slug && p.active !== false);
}
