import type { SiteContent } from '@/lib/cms/types';
import { DEFAULT_FOOTER } from '@/lib/footer-defaults';
import {
  DEFAULT_ABOUT_PAGE,
  DEFAULT_BNS_PAGE,
  DEFAULT_IPC_PAGE,
  DEFAULT_PRIVACY_PAGE,
  DEFAULT_TERMS_PAGE,
} from '@/lib/site-page-content';
import { mergeIntegrationSettings } from '@/lib/integration-settings';
import * as nav from '@/lib/seo-nav';

const DEFAULT_COURTS_PAGE = {
  title: 'Lawyers by Court',
  subtitle: 'Advocates practicing in Supreme Court, High Courts, District & Family Courts across India.',
  metaTitle: 'Find lawyers by Court in India',
  metaDescription:
    'Advocates practicing in Supreme Court, High Courts, District & Family Courts across India.',
};

/** Default navigation & SEO content — seeded into CMS, editable in admin */
export function buildDefaultSiteContent(): SiteContent {
  const sectionBody = (title: string) =>
    `<p>This page covers <strong>${title}</strong>. Content is managed from the LawyerSpot admin panel under Site Content.</p>`;

  return {
    utilityNav: nav.utilityNav,
    mainNav: nav.mainNav,
    languages: nav.languages,
    ipcSections: nav.ipcSections.map((s) => ({ ...s, body: sectionBody(s.title) })),
    bnsSections: nav.bnsSections.map((s) => ({ ...s, body: sectionBody(s.title) })),
    courts: nav.courts.map((c) => ({
      ...c,
      body: `<p>Find experienced advocates practicing before the <strong>${c.name}</strong> in ${c.city}. Browse verified lawyers with experience in matters listed before this court, and book confidential consultations online.</p><p>Whether you need representation, legal opinion, or document drafting for proceedings at ${c.name}, LawyerSpot connects you with bar council–verified advocates.</p>`,
      metaTitle: `Lawyers for ${c.name}`,
      metaDescription: `Find advocates practicing before ${c.name} in ${c.city}. Book verified lawyers online.`,
    })),
    acts: nav.acts.map((a) => ({ ...a, body: sectionBody(a.title) })),
    popularSearches: nav.popularSearches,
    legalGuides: nav.legalGuides,
    qaCategories: nav.qaCategories,
    hero: {
      title: "India's Legal Intelligence Platform",
      subtitle:
        'Search verified lawyers, free legal answers, guides & acts — built for scale, SEO & trust.',
      badges: ['100% Confidential', 'Bar Council Verified'],
    },
    about: {
      title: DEFAULT_ABOUT_PAGE.title,
      body: DEFAULT_ABOUT_PAGE.body,
      metaTitle: DEFAULT_ABOUT_PAGE.metaTitle,
      metaDescription: DEFAULT_ABOUT_PAGE.metaDescription,
    },
    termsPage: { ...DEFAULT_TERMS_PAGE },
    privacyPage: { ...DEFAULT_PRIVACY_PAGE },
    customCmsPages: [],
    ipcPage: { ...DEFAULT_IPC_PAGE },
    bnsPage: { ...DEFAULT_BNS_PAGE },
    footer: { ...DEFAULT_FOOTER, cityPracticeLinks: [...DEFAULT_FOOTER.cityPracticeLinks] },
    courtsPage: { ...DEFAULT_COURTS_PAGE },
    integrations: mergeIntegrationSettings(),
  };
}
