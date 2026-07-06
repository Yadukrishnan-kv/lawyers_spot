'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, Eye, CheckCircle, XCircle, Search, X, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type PendingLawyer = {
  id: number;
  enrollment_no: string | null;
  name: string;
  father_name: string | null;
  mobile: string | null;
  email: string | null;
  gender: string | null;
  district: string | null;
  state: string | null;
  bar_council: string | null;
  practice_areas: string | null;
  status: string;
  rejection_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  import_batch_id: string | null;
  created_at: string;
  updated_at: string;
};

type Stats = { pending: number; verified: number; rejected: number };

type PaginatedResult = {
  rows: PendingLawyer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function PendingLawyersManager() {
  const [data, setData] = useState<PaginatedResult | null>(null);
  const [stats, setStats] = useState<Stats>({ pending: 0, verified: 0, rejected: 0 });
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewLawyer, setViewLawyer] = useState<PendingLawyer | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<Record<string, number> | null>(null);
  const [confirmVerify, setConfirmVerify] = useState<PendingLawyer | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [rejectLawyer, setRejectLawyer] = useState<PendingLawyer | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (districtFilter) params.set('district', districtFilter);

      const [res, statsRes, distRes] = await Promise.all([
        fetch(`/api/admin/pending-lawyers?${params}`),
        fetch('/api/admin/pending-lawyers/stats'),
        fetch('/api/admin/pending-lawyers/districts'),
      ]);

      if (res.ok) setData(await res.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (distRes.ok) setDistricts(await distRes.json());
    } catch {
      setToast({ type: 'error', message: 'Failed to load data' });
    }
    setLoading(false);
  }, [page, search, statusFilter, districtFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
  }

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const res = await fetch('/api/admin/pending-lawyers/import', { method: 'POST', body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Import failed');
      setImportResult(result);
      showToast('success', `Imported ${result.imported} lawyers`);
      fetchData();
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Import failed');
    }
    setImporting(false);
  }

  async function handleVerify() {
    if (!confirmVerify) return;
    setVerifyLoading(true);
    try {
      const res = await fetch(`/api/admin/pending-lawyers/${confirmVerify.id}/verify`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Verification failed');
      showToast('success', result.message || 'Lawyer verified');
      setConfirmVerify(null);
      setViewLawyer(null);
      fetchData();
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Verification failed');
    }
    setVerifyLoading(false);
  }

  async function handleReject() {
    if (!rejectLawyer || !rejectReason.trim()) return;
    setRejectLoading(true);
    try {
      const res = await fetch(`/api/admin/pending-lawyers/${rejectLawyer.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Rejection failed');
      showToast('success', 'Lawyer rejected');
      setRejectLawyer(null);
      setRejectReason('');
      setViewLawyer(null);
      fetchData();
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Rejection failed');
    }
    setRejectLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this record permanently?')) return;
    try {
      const res = await fetch(`/api/admin/pending-lawyers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('success', 'Record deleted');
      fetchData();
    } catch {
      showToast('error', 'Delete failed');
    }
  }

  const rows = data?.rows ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const from = totalItems === 0 ? 0 : (page - 1) * 15 + 1;
  const to = Math.min(page * 15, totalItems);

  function statusBadge(status: string) {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
    }
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="card border-amber-200 bg-amber-50">
          <div className="card-body text-center">
            <p className="text-amber-600 text-2xl font-bold mb-0">{stats.pending}</p>
            <p className="text-amber-600 text-sm mb-0">Pending</p>
          </div>
        </div>
        <div className="card border-emerald-200 bg-emerald-50">
          <div className="card-body text-center">
            <p className="text-emerald-600 text-2xl font-bold mb-0">{stats.verified}</p>
            <p className="text-emerald-600 text-sm mb-0">Verified</p>
          </div>
        </div>
        <div className="card border-red-200 bg-red-50">
          <div className="card-body text-center">
            <p className="text-red-600 text-2xl font-bold mb-0">{stats.rejected}</p>
            <p className="text-red-600 text-sm mb-0">Rejected</p>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, mobile, enrollment..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={districtFilter}
              onChange={(e) => { setDistrictFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <Button onClick={() => setImportOpen(true)} className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Import Lawyers
            </Button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered text-nowrap border-bottom mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Enrollment</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>District</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 mx-auto" />
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-6">
                      No records found. Import an Excel file to get started.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={row.id}>
                      <td>{from + idx}</td>
                      <td className="fw-semibold">{row.name}</td>
                      <td>{row.enrollment_no || '—'}</td>
                      <td>{row.mobile || '—'}</td>
                      <td>{row.email || '—'}</td>
                      <td>{row.district || '—'}</td>
                      <td>{statusBadge(row.status)}</td>
                      <td className="text-end text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          title="View"
                          onClick={async () => {
                            setViewLoading(true);
                            try {
                              const res = await fetch(`/api/admin/pending-lawyers/${row.id}`);
                              if (res.ok) setViewLawyer(await res.json());
                            } catch { /* ignore */ }
                            setViewLoading(false);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalItems > 15 && (
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
              <p className="text-muted fs-12 mb-0">
                Showing {from}–{to} of {totalItems}
              </p>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button type="button" className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev !== undefined && p - prev > 1;
                    return (
                      <span key={p} className="d-flex">
                        {showEllipsis && (
                          <li className="page-item disabled"><span className="page-link">…</span></li>
                        )}
                        <li className={`page-item ${p === page ? 'active' : ''}`}>
                          <button type="button" className="page-link" onClick={() => setPage(p)}>{p}</button>
                        </li>
                      </span>
                    );
                  })}
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button type="button" className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => !importing && setImportOpen(false)}>
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-navy-700 dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-navy-700">
              <div>
                <h2 className="text-lg font-bold text-navy-900 dark:text-white">Import Lawyers</h2>
                <p className="text-muted fs-12 mb-0 mt-1">Upload .xlsx or .xls file</p>
              </div>
              <button type="button" className="btn btn-sm btn-light rounded-circle p-2" onClick={() => setImportOpen(false)} disabled={importing}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4">
              {!importResult ? (
                <>
                  <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">
                      {importFile ? importFile.name : 'Click to select file'}
                    </p>
                    <p className="text-xs text-slate-400">Accepted: .xlsx, .xls (max 10MB)</p>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold mb-0">Import Complete</p>
                      <p className="text-xs text-muted mb-0">Total rows: {importResult.totalRows}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <p className="text-emerald-700 font-bold text-lg mb-0">{importResult.imported}</p>
                      <p className="text-emerald-700 text-xs mb-0">Imported</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <p className="text-amber-700 font-bold text-lg mb-0">{importResult.duplicates}</p>
                      <p className="text-amber-700 text-xs mb-0">Duplicates</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <p className="text-red-700 font-bold text-lg mb-0">{importResult.invalid}</p>
                      <p className="text-red-700 text-xs mb-0">Invalid</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 dark:border-navy-700 dark:bg-navy-800">
              <Button variant="secondary" onClick={() => { setImportOpen(false); setImportFile(null); setImportResult(null); }} disabled={importing}>
                {importResult ? 'Close' : 'Cancel'}
              </Button>
              {!importResult && (
                <Button onClick={handleImport} disabled={!importFile || importing}>
                  {importing ? 'Importing…' : 'Import'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {viewLawyer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setViewLawyer(null)}>
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-navy-700 dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4 dark:border-navy-700 dark:bg-navy-900">
              <div>
                <h2 className="text-lg font-bold text-navy-900 dark:text-white">Lawyer Details</h2>
                <p className="text-muted fs-12 mb-0 mt-1">#{viewLawyer.id} · {viewLawyer.name}</p>
              </div>
              <button type="button" className="btn btn-sm btn-light rounded-circle p-2" onClick={() => setViewLawyer(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Name', viewLawyer.name],
                  ['Enrollment No', viewLawyer.enrollment_no],
                  ['Father Name', viewLawyer.father_name],
                  ['Gender', viewLawyer.gender],
                  ['Mobile', viewLawyer.mobile],
                  ['Email', viewLawyer.email],
                  ['District', viewLawyer.district],
                  ['State', viewLawyer.state],
                  ['Bar Council', viewLawyer.bar_council],
                  ['Practice Areas', viewLawyer.practice_areas],
                  ['Status', viewLawyer.status],
                  ['Import Batch', viewLawyer.import_batch_id],
                  ['Verified By', viewLawyer.verified_by],
                  ['Verified At', viewLawyer.verified_at],
                  ['Rejected By', viewLawyer.rejected_by],
                  ['Rejected At', viewLawyer.rejected_at],
                  ['Rejection Reason', viewLawyer.rejection_reason],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs text-muted mb-1">{label as string}</p>
                    <p className="text-sm font-medium mb-0">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 dark:border-navy-700 dark:bg-navy-800">
              <Button variant="secondary" onClick={() => setViewLawyer(null)}>Close</Button>
              {viewLawyer.status === 'pending' && (
                <>
                  <Button
                    variant="secondary"
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => { setRejectLawyer(viewLawyer); setRejectReason(''); }}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                  <Button onClick={() => setConfirmVerify(viewLawyer)}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Verify
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmVerify && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => !verifyLoading && setConfirmVerify(null)}>
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-navy-700 dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">Verify Lawyer</h2>
              <p className="text-sm text-muted mt-2">
                Are you sure you want to verify <strong>{confirmVerify.name}</strong>?
                This will copy their data to the main lawyers table and generate login credentials.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 dark:border-navy-700 dark:bg-navy-800">
              <Button variant="secondary" onClick={() => setConfirmVerify(null)} disabled={verifyLoading}>Cancel</Button>
              <Button onClick={handleVerify} disabled={verifyLoading}>
                {verifyLoading ? 'Verifying…' : 'Yes, Verify'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {rejectLawyer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => !rejectLoading && setRejectLawyer(null)}>
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-navy-700 dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">Reject Lawyer</h2>
              <p className="text-sm text-muted mt-2 mb-3">
                Rejecting <strong>{rejectLawyer.name}</strong>. Please provide a reason:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Rejection reason (required)..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 dark:border-navy-700 dark:bg-navy-800">
              <Button variant="secondary" onClick={() => setRejectLawyer(null)} disabled={rejectLoading}>Cancel</Button>
              <Button
                onClick={handleReject}
                disabled={rejectLoading || !rejectReason.trim()}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {rejectLoading ? 'Rejecting…' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
