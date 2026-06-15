'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { CmsData, CourtEntry } from '@/lib/cms/types';
import { AdminInput, SaveBar, useCmsSave } from '@/components/admin/cms-editor';

type Props = {
  initial: CmsData;
  court: CourtEntry;
  isNew?: boolean;
  backHref?: string;
};

export function CourtEditForm({ initial, court: initialCourt, isNew = false, backHref = '/admin/footer' }: Props) {
  const router = useRouter();
  const [cms, setCms] = useState(initial);
  const [court, setCourt] = useState(initialCourt);
  const { save, saving, message } = useCmsSave();

  function patch(p: Partial<CourtEntry>) {
    setCourt((c) => ({ ...c, ...p }));
  }

  async function handleSave() {
    const courts = [...cms.siteContent.courts];
    if (isNew) {
      if (courts.some((c) => c.slug === court.slug)) {
        alert('A court with this slug already exists.');
        return;
      }
      courts.push(court);
    } else {
      const idx = courts.findIndex((c) => c.slug === initialCourt.slug);
      if (idx < 0) return;
      courts[idx] = court;
    }
    const next = { ...cms, siteContent: { ...cms.siteContent, courts } };
    const ok = await save(next);
    if (ok) {
      setCms(next);
      router.push(backHref);
      router.refresh();
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 className="card-title mb-0">{isNew ? 'Add court' : `Edit — ${court.name}`}</h3>
            <p className="text-muted mb-0 fs-12">Public page: /court/{court.slug || '…'}</p>
          </div>
          {!isNew && court.slug && (
            <Link
              href={`/court/${court.slug}`}
              target="_blank"
              className="btn btn-sm btn-outline-secondary"
            >
              <ExternalLink className="h-4 w-4 me-1 d-inline" />
              View live
            </Link>
          )}
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <AdminInput label="Court name" value={court.name} onChange={(v) => patch({ name: v })} />
            </div>
            <div className="col-md-6">
              <AdminInput label="City" value={court.city} onChange={(v) => patch({ city: v })} />
            </div>
            <div className="col-12">
              <AdminInput label="URL slug" value={court.slug} onChange={(v) => patch({ slug: v })} />
            </div>
            <div className="col-12">
              <label className="form-label">Page content (HTML)</label>
              <textarea
                className="form-control font-monospace"
                rows={8}
                value={court.body ?? ''}
                onChange={(e) => patch({ body: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="SEO title"
                value={court.metaTitle ?? ''}
                onChange={(v) => patch({ metaTitle: v })}
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="SEO description"
                value={court.metaDescription ?? ''}
                onChange={(v) => patch({ metaDescription: v })}
              />
            </div>
          </div>
          <div className="mt-4 d-flex gap-2">
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save court'}
            </button>
            <Link href={backHref} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saving} message={message} />
    </div>
  );
}
