'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, Eye, Search, FileSpreadsheet, FileText, X } from 'lucide-react';
import type { CmsData, Lawyer } from '@/lib/cms/types';
import { lawyerProfilePath } from '@/lib/lawyer-slug';
import { useCmsSave } from '@/components/admin/cms-editor';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import { VerificationBadges } from '@/components/lawyer/verification-badges';
import { planNameById } from '@/lib/subscription';
import {
  emptyLawyerListFilters,
  filterLawyers,
  collectUniqueCourts,
  lawyersToExportRows,
  downloadLawyersExcel,
  downloadLawyersPdf,
  type LawyerListFilters,
} from '@/lib/admin/lawyers-list-utils';

export function LawyersManager({ initial }: { initial: CmsData }) {
  const router = useRouter();
  const [cms, setCms] = useState(initial);
  const [filters, setFilters] = useState<LawyerListFilters>(emptyLawyerListFilters);
  const { save } = useCmsSave();

  const practiceLabel = useMemo(() => {
    const map = new Map(cms.practiceAreas.map((p) => [p.slug, p.name]));
    return (slug: string) => map.get(slug) ?? slug;
  }, [cms.practiceAreas]);

  const cityLabel = useMemo(() => {
    const map = new Map(cms.cities.map((c) => [c.slug, c.name]));
    return (slug?: string, location?: string) => {
      if (slug && map.has(slug)) return map.get(slug)!;
      return location ?? '';
    };
  }, [cms.cities]);

  const courtOptions = useMemo(() => collectUniqueCourts(cms.lawyers), [cms.lawyers]);

  const filteredLawyers = useMemo(
    () => filterLawyers(cms.lawyers, filters, cms.cities),
    [cms.lawyers, cms.cities, filters],
  );

  const planLabel = (id?: string) => planNameById(cms.subscriptionPlans ?? [], id);

  const hasActiveFilters =
    filters.q ||
    filters.practice ||
    filters.citySlug ||
    filters.court ||
    filters.verified ||
    filters.plan ||
    filters.topRated;

  function updateFilter<K extends keyof LawyerListFilters>(key: K, value: LawyerListFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters(emptyLawyerListFilters);
  }

  function exportRows() {
    return lawyersToExportRows(filteredLawyers, practiceLabel, cityLabel, planLabel);
  }

  function handleExportExcel() {
    if (filteredLawyers.length === 0) {
      alert('No lawyers match the current filters.');
      return;
    }
    downloadLawyersExcel(exportRows());
  }

  function handleExportPdf() {
    if (filteredLawyers.length === 0) {
      alert('No lawyers match the current filters.');
      return;
    }
    downloadLawyersPdf(exportRows(), 'LawyerSpot — Lawyers');
  }

  function persistLawyers(list: Lawyer[]) {
    const next = { ...cms, lawyers: list };
    setCms(next);
    return next;
  }

  function addNew() {
    router.push('/admin/lawyers/new');
  }

  function remove(id: string) {
    if (!confirm('Delete this lawyer?')) return;
    const next = persistLawyers(cms.lawyers.filter((l) => l.id !== id));
    save(next);
  }

  return (
    <div>
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 className="card-title mb-0">Lawyers</h3>
            <p className="text-muted mb-0 fs-12">
              {filteredLawyers.length} of {cms.lawyers.length} shown — edit for full profile
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleExportExcel}
              title="Download as CSV (opens in Excel)"
            >
              <FileSpreadsheet className="h-4 w-4 me-1 d-inline" />
              Excel
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleExportPdf}
              title="Open printable PDF (Save as PDF in print dialog)"
            >
              <FileText className="h-4 w-4 me-1 d-inline" />
              PDF
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={addNew}>
              <Plus className="h-4 w-4 me-1 d-inline" /> Add lawyer
            </button>
          </div>
        </div>
        <div className="card-body border-bottom pb-4">
          <div className="row g-3 align-items-end">
            <div className="col-lg-4">
              <label className="form-label fs-12 text-muted mb-1">Search</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Search className="h-4 w-4 text-muted" />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Name, phone, firm, courts…"
                  value={filters.q}
                  onChange={(e) => updateFilter('q', e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 col-lg-2">
              <label className="form-label fs-12 text-muted mb-1">Practice area</label>
              <select
                className="form-select"
                value={filters.practice}
                onChange={(e) => updateFilter('practice', e.target.value)}
              >
                <option value="">All practices</option>
                {cms.practiceAreas.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 col-lg-2">
              <label className="form-label fs-12 text-muted mb-1">City</label>
              <select
                className="form-select"
                value={filters.citySlug}
                onChange={(e) => updateFilter('citySlug', e.target.value)}
              >
                <option value="">All cities</option>
                {cms.cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 col-lg-2">
              <label className="form-label fs-12 text-muted mb-1">Court</label>
              <select
                className="form-select"
                value={filters.court}
                onChange={(e) => updateFilter('court', e.target.value)}
              >
                <option value="">All courts</option>
                {courtOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 col-lg-2">
              <label className="form-label fs-12 text-muted mb-1">Verified</label>
              <select
                className="form-select"
                value={filters.verified}
                onChange={(e) => updateFilter('verified', e.target.value as LawyerListFilters['verified'])}
              >
                <option value="">All</option>
                <option value="yes">Verified only</option>
                <option value="no">Not verified</option>
              </select>
            </div>
            <div className="col-md-6 col-lg-2">
              <label className="form-label fs-12 text-muted mb-1">Plan</label>
              <select
                className="form-select"
                value={filters.plan}
                onChange={(e) => updateFilter('plan', e.target.value)}
              >
                <option value="">All plans</option>
                {(cms.subscriptionPlans ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 col-lg-2">
              <label className="form-label fs-12 text-muted mb-1">Top rated</label>
              <select
                className="form-select"
                value={filters.topRated}
                onChange={(e) => updateFilter('topRated', e.target.value as LawyerListFilters['topRated'])}
              >
                <option value="">All</option>
                <option value="yes">Top rated only</option>
                <option value="no">Not top rated</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-3">
              <button type="button" className="btn btn-sm btn-link text-decoration-none p-0" onClick={clearFilters}>
                <X className="h-3 w-3 me-1 d-inline" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
        <div className="card-body pt-0">
          <AdminDataTable
            rows={filteredLawyers}
            rowKey={(l) => l.id}
            pageSize={10}
            emptyMessage="No lawyers match your search or filters."
            columns={[
              {
                key: 'name',
                header: 'Name',
                render: (l) => (
                  <>
                    <span className="fw-semibold">{l.name}</span>
                    {l.verified && (
                      <span className="badge bg-success-subtle text-success ms-1">Verified</span>
                    )}
                    {l.topRated && (
                      <span className="badge bg-warning-subtle text-warning ms-1">Top Rated</span>
                    )}
                  </>
                ),
              },
              {
                key: 'plan',
                header: 'Plan',
                render: (l) => planLabel(l.subscriptionPlanId),
              },
              {
                key: 'verification',
                header: 'Verification',
                render: (l) => <VerificationBadges lawyer={l} layout="stack" />,
              },
              { key: 'location', header: 'Location', render: (l) => l.location },
              { key: 'practice', header: 'Practice', render: (l) => practiceLabel(l.practice) },
              {
                key: 'courts',
                header: 'Courts',
                className: 'text-wrap',
                render: (l) =>
                  (l.courts ?? []).length > 0 ? (
                    <span className="fs-12">{(l.courts ?? []).join(', ')}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  ),
              },
              {
                key: 'rating',
                header: 'Rating',
                render: (l) => `${l.rating} (${l.reviews})`,
              },
            ]}
            renderActions={(l) => (
              <>
                <Link
                  href={lawyerProfilePath(l)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary me-1"
                  title="View public profile"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  href={`/admin/lawyers/${encodeURIComponent(l.id)}/edit`}
                  className="btn btn-sm btn-outline-primary me-1"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => remove(l.id)}
                  className="btn btn-sm btn-outline-danger"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
