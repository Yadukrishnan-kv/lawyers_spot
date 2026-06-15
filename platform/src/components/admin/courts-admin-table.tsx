'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { CmsData, CourtEntry } from '@/lib/cms/types';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import { useCmsSave } from '@/components/admin/cms-editor';

type Props = {
  cms: CmsData;
  onCmsChange: (cms: CmsData) => void;
};

export function CourtsAdminTable({ cms, onCmsChange }: Props) {
  const { save } = useCmsSave();
  const courts = cms.siteContent.courts;

  async function remove(court: CourtEntry) {
    if (!confirm(`Delete "${court.name}"?`)) return;
    const next = {
      ...cms,
      siteContent: {
        ...cms.siteContent,
        courts: courts.filter((c) => c.slug !== court.slug),
      },
    };
    onCmsChange(next);
    await save(next);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0 fs-12">{courts.length} courts · edit opens full page</p>
        <Link href="/admin/footer/courts/new" className="btn btn-sm btn-primary">
          <Plus className="h-4 w-4 me-1 d-inline" />
          Add court
        </Link>
      </div>
      <AdminDataTable
        rows={courts}
        rowKey={(c) => c.slug}
        editHref={(c) => `/admin/footer/courts/${encodeURIComponent(c.slug)}/edit`}
        onDelete={remove}
        columns={[
          {
            key: 'name',
            header: 'Court name',
            render: (c) => <span className="fw-semibold">{c.name}</span>,
          },
          { key: 'city', header: 'City', render: (c) => c.city },
          {
            key: 'slug',
            header: 'Slug',
            render: (c) => <code className="fs-12">{c.slug}</code>,
          },
        ]}
      />
    </div>
  );
}
