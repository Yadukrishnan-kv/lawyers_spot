'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import type { SectionRecord } from '@/lib/sections-data';

type Props = {
  type: 'ipc' | 'bns';
};

export function SectionsList({ type }: Props) {
  const router = useRouter();
  const prefix = type === 'ipc' ? 'IPC' : 'BNS';
  const [sections, setSections] = useState<SectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/sections?type=${type}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load');
      const data = (await res.json()) as SectionRecord[];
      setSections(data);
    } catch {
      setError('Failed to load sections. Make sure the backend API is running.');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  async function handleDelete(s: SectionRecord) {
    if (!confirm(`Delete ${s.title}? This will set it to inactive.`)) return;
    try {
      const res = await fetch(`/api/admin/sections/${s.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Delete failed');
      }
      setSections((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 className="card-title mb-0">{prefix} Sections</h3>
            <p className="text-muted mb-0 fs-12">
              {sections.length} section{sections.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => router.push(`/admin/sections/${type}/new`)}
          >
            <Plus className="h-4 w-4 me-1 d-inline" /> Create
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4 text-muted">Loading sections...</div>
          ) : error ? (
            <div className="alert alert-danger py-2 mb-0">{error}</div>
          ) : (
            <AdminDataTable
              rows={sections}
              rowKey={(s) => String(s.id)}
              columns={[
                { key: 'id', header: 'ID', render: (s) => <span className="fw-semibold">{s.id}</span> },
                { key: 'sectionNumber', header: 'Section No.', render: (s) => <code>{s.sectionNumber}</code> },
                { key: 'title', header: 'Title', render: (s) => <span>{s.title}</span> },
                {
                  key: 'category',
                  header: 'Category',
                  render: (s) => s.category || <span className="text-muted">—</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (s) =>
                    s.status === 'active' ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    ),
                },
                {
                  key: 'createdAt',
                  header: 'Created',
                  render: (s) =>
                    s.createdAt
                      ? new Date(s.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—',
                },
              ]}
              editHref={(s) => `/admin/sections/${type}/${s.id}/edit`}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
