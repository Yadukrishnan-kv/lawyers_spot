'use client';

import { AdminDataTable } from '@/components/admin/admin-data-table';
import type { AdminClient } from '@/lib/cms/store';

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: 'bg-success-transparent text-success',
    blocked: 'bg-danger-transparent text-danger',
    deleted: 'bg-secondary-transparent text-secondary',
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

export function ClientsTable({ clients }: { clients: AdminClient[] }) {
  return (
    <AdminDataTable
      rows={clients}
      rowKey={(c) => c.id}
      pageSize={15}
      showActions={false}
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
    />
  );
}
