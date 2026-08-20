'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import { AdminFormModal } from '@/components/admin/admin-form-modal';
import type { AdminClient } from '@/lib/cms/store';

const STATUS_OPTIONS = ['active', 'blocked'] as const;

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: 'bg-success-transparent text-success',
    blocked: 'bg-danger-transparent text-danger',
  };
  return (
    <span className={`badge capitalize ${colorMap[status] ?? 'bg-secondary-transparent text-secondary'}`}>
      {status}
    </span>
  );
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

type EditState = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
};

export function ClientsTable({ clients }: { clients: AdminClient[] }) {
  const [rows, setRows] = useState(clients);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openEdit(c: AdminClient) {
    setError('');
    setEditing({ id: c.id, name: c.name, email: c.email, phone: c.phone ?? '', status: c.status });
  }

  async function saveEdit() {
    if (!editing) return;
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editing.name,
          email: editing.email,
          phone: editing.phone,
          status: editing.status,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to update client');
      setRows((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...data.client } : c)),
      );
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: AdminClient) {
    if (!confirm(`Delete ${c.name}? This will permanently remove their account.`)) return;
    setDeletingId(c.id);
    try {
      const res = await fetch(`/api/admin/clients/${c.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to delete client');
      setRows((prev) => prev.filter((row) => row.id !== c.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete client');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminDataTable
        rows={rows}
        rowKey={(c) => c.id}
        pageSize={15}
        emptyMessage="No clients have registered yet."
        columns={[
          {
            key: 'name',
            header: 'Client',
            render: (c) => (
              <>
                <p className="fw-semibold mb-0">{c.name}</p>
                <p className="text-muted fs-12 mb-0">{c.email}</p>
              </>
            ),
          },
          { key: 'phone', header: 'Phone', render: (c) => c.phone || '—' },
          {
            key: 'bookings',
            header: 'Bookings',
            render: (c) => c.bookings_count,
          },
          {
            key: 'status',
            header: 'Status',
            render: (c) => <StatusBadge status={c.status} />,
          },
          {
            key: 'registered',
            header: 'Registered',
            render: (c) => formatDate(c.created_at),
          },
        ]}
        renderActions={(c) => (
          <>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary me-1"
              title="Edit"
              onClick={() => openEdit(c)}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              title="Delete"
              disabled={deletingId === c.id}
              onClick={() => remove(c)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      />

      <AdminFormModal
        open={editing !== null}
        title="Edit client"
        onClose={() => setEditing(null)}
        onSave={saveEdit}
        saving={saving}
      >
        {editing && (
          <div className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <label className="text-sm font-semibold">Name</label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="mt-1 h-10 w-full rounded-lg border px-3 dark:border-navy-700 dark:bg-navy-800"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Email</label>
              <input
                type="email"
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                className="mt-1 h-10 w-full rounded-lg border px-3 dark:border-navy-700 dark:bg-navy-800"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Phone</label>
              <input
                type="tel"
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                className="mt-1 h-10 w-full rounded-lg border px-3 dark:border-navy-700 dark:bg-navy-800"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Status</label>
              <select
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="mt-1 h-10 w-full rounded-lg border px-3 dark:border-navy-700 dark:bg-navy-800"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </AdminFormModal>
    </>
  );
}
