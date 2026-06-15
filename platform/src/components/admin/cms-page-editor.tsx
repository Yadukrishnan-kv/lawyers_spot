'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import type { CmsData, CmsPageFields, CustomCmsPage, LegalSection, SiteContent } from '@/lib/cms/types';
import { AdminInput, SaveBar, useCmsSave } from '@/components/admin/cms-editor';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import {
  findCustomPage,
  findSystemPageDef,
  newCustomCmsPage,
  publicPathForPage,
  slugifyCmsPageSlug,
  type SystemCmsPageDef,
} from '@/lib/admin/cms-pages-registry';
import { newLegalSection } from '@/lib/site-page-content';

function LegalSectionsEditor({
  label,
  prefix,
  sections,
  onChange,
}: {
  label: string;
  prefix: 'ipc' | 'bns';
  sections: LegalSection[];
  onChange: (sections: LegalSection[]) => void;
}) {
  const codeLabel = prefix === 'ipc' ? 'IPC' : 'BNS';

  function patch(index: number, patch: Partial<LegalSection>) {
    const next = [...sections];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{label}</h5>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => onChange([...sections, newLegalSection(prefix)])}
        >
          <Plus className="h-4 w-4 me-1 d-inline" />
          Add section
        </button>
      </div>
      {sections.map((s, i) => (
        <div key={s.slug + i} className="border rounded p-3 mb-3">
          <div className="row g-2">
            <div className="col-md-4">
              <AdminInput label="Title" value={s.title} onChange={(v) => patch(i, { title: v })} />
            </div>
            <div className="col-md-2">
              <AdminInput
                label={`${codeLabel} code`}
                value={s.code ?? ''}
                onChange={(v) => patch(i, { code: v })}
              />
            </div>
            <div className="col-md-4">
              <AdminInput label="URL slug" value={s.slug} onChange={(v) => patch(i, { slug: v })} />
            </div>
            <div className="col-md-2 d-flex align-items-end justify-content-end">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => onChange(sections.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="col-12">
              <RichTextEditor
                label="Section description"
                value={s.body ?? ''}
                onChange={(body) => patch(i, { body })}
                minHeight={180}
              />
            </div>
            <div className="col-12">
              <Link href={`/acts/${s.slug}`} target="_blank" className="fs-12 text-decoration-none">
                <ExternalLink className="h-3 w-3 me-1 d-inline" />
                Preview /acts/{s.slug}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type Props = {
  initial: CmsData;
  pageId: string;
  isNew?: boolean;
};

export function CmsPageEditor({ initial, pageId, isNew = false }: Props) {
  const router = useRouter();
  const systemDef = isNew ? undefined : findSystemPageDef(pageId);
  const [cms, setCms] = useState(initial);
  const [customPage, setCustomPage] = useState<CustomCmsPage>(() => {
    if (isNew) return newCustomCmsPage();
    const existing = findCustomPage(initial.siteContent, pageId);
    if (existing) return { ...existing };
    return newCustomCmsPage();
  });
  const { save, saving, message } = useCmsSave();

  function setSiteContent(siteContent: SiteContent) {
    setCms({ ...cms, siteContent });
  }

  const publicPath = systemDef
    ? publicPathForPage(systemDef.slug, systemDef.kind)
    : publicPathForPage(customPage.slug, 'custom');

  async function handleSave() {
    let next = cms;

    if (isNew || (!systemDef && findCustomPage(cms.siteContent, pageId))) {
      const normalized: CustomCmsPage = {
        ...customPage,
        slug: slugifyCmsPageSlug(customPage.slug),
        metaTitle: customPage.metaTitle || customPage.title,
      };
      const list = cms.siteContent.customCmsPages ?? [];
      const exists = list.some((p) => p.id === normalized.id);
      const customCmsPages = exists
        ? list.map((p) => (p.id === normalized.id ? normalized : p))
        : [...list, normalized];
      next = {
        ...cms,
        siteContent: { ...cms.siteContent, customCmsPages },
      };
    }

    const ok = await save(next);
    if (ok) {
      setCms(next);
      router.push('/admin/cms-pages');
      router.refresh();
    }
  }

  if (systemDef?.kind === 'legal-listing') {
    return (
      <LegalListingEditor
        cms={cms}
        def={systemDef}
        setSiteContent={setSiteContent}
        publicPath={publicPath}
        onSave={handleSave}
        saving={saving}
        message={message}
      />
    );
  }

  const staticKey = systemDef?.staticKey ?? null;
  const page = staticKey
    ? (cms.siteContent[staticKey] as CmsPageFields)
    : customPage;

  const setPage = (patch: Partial<CmsPageFields>) => {
    if (staticKey) {
      setSiteContent({
        ...cms.siteContent,
        [staticKey]: { ...page, ...patch },
      });
    } else {
      setCustomPage({ ...customPage, ...patch });
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h3 className="card-title mb-0">{isNew ? 'New CMS page' : 'Edit page'}</h3>
          <p className="text-muted mb-0 fs-12">Public URL: <code>{publicPath}</code></p>
        </div>
        <Link href={publicPath} target="_blank" className="btn btn-sm btn-outline-secondary">
          <ExternalLink className="h-4 w-4 me-1 d-inline" />
          View page
        </Link>
      </div>
      <div className="card-body">
        {!systemDef && (
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <AdminInput
                label="URL slug"
                value={customPage.slug}
                onChange={(v) => setCustomPage({ ...customPage, slug: slugifyCmsPageSlug(v) })}
              />
              <p className="text-muted fs-12 mb-0">Published at /pages/{slugifyCmsPageSlug(customPage.slug)}</p>
            </div>
          </div>
        )}
        <div className="row g-3">
          <div className="col-md-6">
            <AdminInput label="Page heading" value={page.title} onChange={(v) => setPage({ title: v })} />
          </div>
          <div className="col-md-6">
            <AdminInput
              label="SEO title"
              value={page.metaTitle ?? page.title}
              onChange={(v) => setPage({ metaTitle: v })}
            />
          </div>
          {(staticKey === 'termsPage' || staticKey === 'privacyPage' || !systemDef) && (
            <div className="col-md-6">
              <AdminInput
                label="Last updated"
                value={page.lastUpdated ?? ''}
                onChange={(v) => setPage({ lastUpdated: v })}
                placeholder="e.g. June 2026"
              />
            </div>
          )}
          <div className="col-12">
            <AdminInput
              label="SEO description"
              value={page.metaDescription ?? ''}
              onChange={(v) => setPage({ metaDescription: v })}
            />
          </div>
          <div className="col-12">
            <RichTextEditor
              label="Description"
              value={page.body}
              onChange={(body) => setPage({ body })}
              minHeight={320}
              hint={
                staticKey === 'about'
                  ? 'Site stats from Settings → General still appear below this content on the public page.'
                  : undefined
              }
            />
          </div>
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saving} message={message} />
    </div>
  );
}

function LegalListingEditor({
  cms,
  def,
  setSiteContent,
  publicPath,
  onSave,
  saving,
  message,
}: {
  cms: CmsData;
  def: SystemCmsPageDef;
  setSiteContent: (sc: SiteContent) => void;
  publicPath: string;
  onSave: () => Promise<void>;
  saving: boolean;
  message: string;
}) {
  const pageKey = def.listingKey!;
  const page = cms.siteContent[pageKey];

  const setPage = (patch: Partial<typeof page>) => {
    setSiteContent({ ...cms.siteContent, [pageKey]: { ...page, ...patch } });
  };

  const prefix = def.id as 'ipc' | 'bns';

  return (
    <div className="card">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h3 className="card-title mb-0">Edit {def.label}</h3>
          <p className="text-muted mb-0 fs-12">Public URL: <code>{publicPath}</code></p>
        </div>
        <Link href={publicPath} target="_blank" className="btn btn-sm btn-outline-secondary">
          <ExternalLink className="h-4 w-4 me-1 d-inline" />
          View page
        </Link>
      </div>
      <div className="card-body">
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <AdminInput label="Page heading" value={page.title} onChange={(v) => setPage({ title: v })} />
          </div>
          <div className="col-md-6">
            <AdminInput label="SEO title" value={page.metaTitle} onChange={(v) => setPage({ metaTitle: v })} />
          </div>
          <div className="col-12">
            <label className="form-label">Intro text</label>
            <textarea
              className="form-control"
              rows={2}
              value={page.subtitle}
              onChange={(e) => setPage({ subtitle: e.target.value })}
            />
          </div>
          <div className="col-12">
            <AdminInput
              label="SEO description"
              value={page.metaDescription}
              onChange={(v) => setPage({ metaDescription: v })}
            />
          </div>
          <div className="col-12">
            <label className="form-label">Footer note (HTML allowed)</label>
            <textarea
              className="form-control"
              rows={2}
              value={page.footerNote}
              onChange={(e) => setPage({ footerNote: e.target.value })}
            />
          </div>
        </div>
        <LegalSectionsEditor
          label={`${def.label} (detail at /acts/[slug])`}
          prefix={prefix}
          sections={cms.siteContent[def.sectionsKey!]}
          onChange={(sections) =>
            setSiteContent({ ...cms.siteContent, [def.sectionsKey!]: sections })
          }
        />
      </div>
      <SaveBar onSave={onSave} saving={saving} message={message} />
    </div>
  );
}
