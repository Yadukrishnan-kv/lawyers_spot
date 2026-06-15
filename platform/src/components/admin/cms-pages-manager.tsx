'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import type { CmsData } from '@/lib/cms/types';
import { useCmsSave } from '@/components/admin/cms-editor';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import { listCmsPages, type CmsPageListRow } from '@/lib/admin/cms-pages-registry';

export function CmsPagesManager({ initial }: { initial: CmsData }) {
  const router = useRouter();
  const [cms, setCms] = useState(initial);
  const { save, saving } = useCmsSave();

  const rows = useMemo(() => listCmsPages(cms.siteContent), [cms.siteContent]);

  async function handleDelete(row: CmsPageListRow) {
    if (row.system) return;
    if (!confirm(`Delete page "${row.title}"? This cannot be undone.`)) return;

    const customCmsPages = (cms.siteContent.customCmsPages ?? []).filter((p) => p.id !== row.id);
    const next = { ...cms, siteContent: { ...cms.siteContent, customCmsPages } };
    setCms(next);
    const ok = await save(next);
    if (ok) router.refresh();
  }

  return (
    <div className="card">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h3 className="card-title mb-0">CMS pages</h3>
          <p className="text-muted mb-0 fs-12">
            Manage static pages, legal listings, and custom content pages
          </p>
        </div>
        <Link href="/admin/cms-pages/new" className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4 me-1 d-inline" />
          Add page
        </Link>
      </div>
      <div className="card-body pt-0">
        <AdminDataTable<CmsPageListRow>
          rows={rows}
          rowKey={(r) => r.id}
          pageSize={10}
          emptyMessage="No CMS pages yet."
          renderActions={(row) => (
            <div className="d-flex gap-1">
              <Link
                href={row.path}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-secondary"
                title="View public page"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                href={`/admin/cms-pages/${encodeURIComponent(row.id)}/edit`}
                className="btn btn-sm btn-outline-primary"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              {!row.system && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  title="Delete"
                  disabled={saving}
                  onClick={() => handleDelete(row)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          columns={[
            {
              key: 'title',
              header: 'Title',
              render: (r) => (
                <>
                  <span className="fw-semibold">{r.title}</span>
                  {r.system && (
                    <span className="badge bg-light text-dark ms-1 fs-10">System</span>
                  )}
                </>
              ),
            },
            {
              key: 'path',
              header: 'URL',
              render: (r) => <code className="fs-12">{r.path}</code>,
            },
            {
              key: 'kind',
              header: 'Type',
              render: (r) => {
                const labels: Record<CmsPageListRow['kind'], string> = {
                  static: 'Static page',
                  'legal-listing': 'Legal listing',
                  custom: 'Custom page',
                };
                return labels[r.kind];
              },
            },
            {
              key: 'metaTitle',
              header: 'SEO title',
              className: 'text-wrap',
              render: (r) => <span className="fs-12 text-muted">{r.metaTitle}</span>,
            },
          ]}
        />
      </div>
    </div>
  );
}
