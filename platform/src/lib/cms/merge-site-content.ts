import type { SiteContent } from '@/lib/cms/types';
import { buildDefaultSiteContent } from '@/lib/site-content-defaults';
import { mergeIntegrationSettings } from '@/lib/integration-settings';

export function mergeSiteContent(raw?: Partial<SiteContent> | null): SiteContent {
  const base = buildDefaultSiteContent();
  if (!raw) return base;

  return {
    ...base,
    ...raw,
    utilityNav: raw.utilityNav?.length ? raw.utilityNav : base.utilityNav,
    mainNav: raw.mainNav?.length ? raw.mainNav : base.mainNav,
    languages: raw.languages?.length ? raw.languages : base.languages,
    ipcSections: raw.ipcSections?.length ? raw.ipcSections : base.ipcSections,
    bnsSections: raw.bnsSections?.length ? raw.bnsSections : base.bnsSections,
    courts: raw.courts?.length ? raw.courts : base.courts,
    acts: raw.acts?.length ? raw.acts : base.acts,
    popularSearches: raw.popularSearches?.length ? raw.popularSearches : base.popularSearches,
    legalGuides: raw.legalGuides?.length ? raw.legalGuides : base.legalGuides,
    qaCategories: raw.qaCategories?.length ? raw.qaCategories : base.qaCategories,
    hero: { ...base.hero, ...raw.hero },
    about: { ...base.about, ...raw.about },
    termsPage: { ...base.termsPage, ...raw.termsPage },
    privacyPage: { ...base.privacyPage, ...raw.privacyPage },
    customCmsPages: Array.isArray(raw.customCmsPages) ? raw.customCmsPages : base.customCmsPages,
    ipcPage: { ...base.ipcPage, ...raw.ipcPage },
    bnsPage: { ...base.bnsPage, ...raw.bnsPage },
    footer: {
      ...base.footer,
      ...raw.footer,
      sectionTitles: { ...base.footer.sectionTitles, ...raw.footer?.sectionTitles },
      findByCityAll: { ...base.footer.findByCityAll, ...raw.footer?.findByCityAll },
      courtsAll: { ...base.footer.courtsAll, ...raw.footer?.courtsAll },
      legalResources: raw.footer?.legalResources?.length
        ? raw.footer.legalResources
        : base.footer.legalResources,
      bottomLinks: raw.footer?.bottomLinks?.length ? raw.footer.bottomLinks : base.footer.bottomLinks,
      cityPracticeLinks: raw.footer?.cityPracticeLinks?.length
        ? raw.footer.cityPracticeLinks
        : base.footer.cityPracticeLinks,
    },
    courtsPage: { ...base.courtsPage, ...raw.courtsPage },
    integrations: mergeIntegrationSettings(raw.integrations),
  };
}
