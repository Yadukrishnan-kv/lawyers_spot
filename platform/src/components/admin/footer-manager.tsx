'use client';

import { useState } from 'react';
import type { CmsData, SiteContent } from '@/lib/cms/types';
import { AdminInput, SaveBar, useCmsSave } from '@/components/admin/cms-editor';
import { CourtsAdminTable } from '@/components/admin/courts-admin-table';
import { NavLinksTable } from '@/components/admin/nav-links-table';
import { FooterSeoTables } from '@/components/admin/footer-seo-tables';

type Tab = 'brand' | 'courts' | 'links' | 'seo';

function patchFooter(sc: SiteContent, patch: Partial<SiteContent['footer']>) {
  return { ...sc, footer: { ...sc.footer, ...patch } };
}

export function FooterManager({ initial }: { initial: CmsData }) {
  const [cms, setCms] = useState(initial);
  const [tab, setTab] = useState<Tab>('brand');
  const { save, saving, message } = useCmsSave();

  const sc = cms.siteContent;
  const footer = sc.footer;

  function setSiteContent(siteContent: SiteContent) {
    setCms({ ...cms, siteContent });
  }

  async function handleSave() {
    await save(cms);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'brand', label: 'Sections & titles' },
    { id: 'courts', label: 'Courts' },
    { id: 'links', label: 'Footer links' },
    { id: 'seo', label: 'Popular & guides' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">Footer & courts</h3>
        <p className="text-muted mb-0 fs-12">
          Cities and practice areas come from their admin lists. Court pages: /court/[slug]
        </p>
      </div>
      <div className="card-body">
        <ul className="nav nav-tabs mb-4">
          {tabs.map((t) => (
            <li key={t.id} className="nav-item">
              <button
                type="button"
                className={`nav-link ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        {tab === 'brand' && (
          <div className="row g-3">
            <div className="col-12">
              <AdminInput
                label="Footer brand tagline (empty = site description)"
                value={footer.brandTagline}
                onChange={(v) => setSiteContent(patchFooter(sc, { brandTagline: v }))}
              />
            </div>
            {(
              [
                ['findByCity', 'Find by City column title'],
                ['practiceAreas', 'Practice Areas column title'],
                ['courts', 'Courts column title'],
                ['quickLinks', 'Quick Links title'],
                ['legalResources', 'Legal Resources title'],
                ['qaTopics', 'Q&A Topics title'],
                ['cityPractice', 'City × practice block title'],
                ['popularSearches', 'Popular Searches title'],
                ['featuredGuides', 'Featured guides title'],
              ] as const
            ).map(([key, label]) => (
              <div className="col-md-6" key={key}>
                <AdminInput
                  label={label}
                  value={footer.sectionTitles[key]}
                  onChange={(v) =>
                    setSiteContent(
                      patchFooter(sc, {
                        sectionTitles: { ...footer.sectionTitles, [key]: v },
                      }),
                    )
                  }
                />
              </div>
            ))}
            <div className="col-md-4">
              <AdminInput
                label="Max courts in footer (0 = all)"
                type="number"
                value={String(footer.courtsListLimit)}
                onChange={(v) =>
                  setSiteContent(patchFooter(sc, { courtsListLimit: Number(v) || 0 }))
                }
              />
            </div>
            <div className="col-md-4">
              <AdminInput
                label="Max Q&A topics in footer (0 = all)"
                type="number"
                value={String(footer.qaTopicsLimit)}
                onChange={(v) =>
                  setSiteContent(patchFooter(sc, { qaTopicsLimit: Number(v) || 0 }))
                }
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="“All cities” link label"
                value={footer.findByCityAll.label}
                onChange={(v) =>
                  setSiteContent(
                    patchFooter(sc, { findByCityAll: { ...footer.findByCityAll, label: v } }),
                  )
                }
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="“All cities” URL"
                value={footer.findByCityAll.href}
                onChange={(v) =>
                  setSiteContent(
                    patchFooter(sc, { findByCityAll: { ...footer.findByCityAll, href: v } }),
                  )
                }
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="“All courts” link label"
                value={footer.courtsAll.label}
                onChange={(v) =>
                  setSiteContent(
                    patchFooter(sc, { courtsAll: { ...footer.courtsAll, label: v } }),
                  )
                }
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="“All courts” URL"
                value={footer.courtsAll.href}
                onChange={(v) =>
                  setSiteContent(
                    patchFooter(sc, { courtsAll: { ...footer.courtsAll, href: v } }),
                  )
                }
              />
            </div>
            <div className="col-12">
              <h5 className="mt-2">Courts index page (/courts)</h5>
            </div>
            <div className="col-md-6">
              <AdminInput
                label="Page title"
                value={sc.courtsPage.title}
                onChange={(v) =>
                  setSiteContent({ ...sc, courtsPage: { ...sc.courtsPage, title: v } })
                }
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="SEO title"
                value={sc.courtsPage.metaTitle}
                onChange={(v) =>
                  setSiteContent({ ...sc, courtsPage: { ...sc.courtsPage, metaTitle: v } })
                }
              />
            </div>
            <div className="col-12">
              <label className="form-label">Subtitle</label>
              <textarea
                className="form-control"
                rows={2}
                value={sc.courtsPage.subtitle}
                onChange={(e) =>
                  setSiteContent({ ...sc, courtsPage: { ...sc.courtsPage, subtitle: e.target.value } })
                }
              />
            </div>
            <div className="col-12">
              <p className="text-muted fs-12 mb-0">
                Quick links use <strong>utilityNav</strong> from Site Content JSON, or edit below in
                Footer links → Quick links (utility nav).
              </p>
            </div>
          </div>
        )}

        {tab === 'courts' && <CourtsAdminTable cms={cms} onCmsChange={setCms} />}

        {tab === 'links' && (
          <div className="row g-4">
            <div className="col-12">
              <NavLinksTable
                label="Quick links (utility bar / footer quick links)"
                links={sc.utilityNav}
                onChange={(utilityNav) => setSiteContent({ ...sc, utilityNav })}
              />
            </div>
            <div className="col-12">
              <NavLinksTable
                label="Legal resources"
                links={footer.legalResources}
                onChange={(legalResources) => setSiteContent(patchFooter(sc, { legalResources }))}
              />
            </div>
            <div className="col-12">
              <NavLinksTable
                label="City × practice SEO links"
                links={footer.cityPracticeLinks}
                onChange={(cityPracticeLinks) =>
                  setSiteContent(patchFooter(sc, { cityPracticeLinks }))
                }
              />
            </div>
            <div className="col-12">
              <NavLinksTable
                label="Bottom bar (Privacy, Terms, etc.)"
                links={footer.bottomLinks}
                onChange={(bottomLinks) => setSiteContent(patchFooter(sc, { bottomLinks }))}
              />
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div>
            <div className="mb-4">
              <NavLinksTable
                label="Popular search pills"
                links={sc.popularSearches}
                onChange={(popularSearches) => setSiteContent({ ...sc, popularSearches })}
              />
            </div>
            <FooterSeoTables cms={cms} onCmsChange={setCms} />
          </div>
        )}
      </div>
      <SaveBar onSave={handleSave} saving={saving} message={message} />
    </div>
  );
}
