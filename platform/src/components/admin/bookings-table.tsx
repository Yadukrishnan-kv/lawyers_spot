'use client';

import { useMemo, useState, useCallback } from 'react';
import type { BookingRecord } from '@/lib/cms/types';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import { sortByCreatedDesc } from '@/lib/admin/sort-utils';

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled'] as const;

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    pending: 'bg-warning-transparent text-warning',
    confirmed: 'bg-success-transparent text-success',
    cancelled: 'bg-danger-transparent text-danger',
  };
  return (
    <span className={`badge capitalize ${colorMap[status] ?? 'bg-secondary-transparent text-secondary'}`}>
      {status}
    </span>
  );
}

export function BookingsTable({ bookings }: { bookings: BookingRecord[] }) {
  const [rows, setRows] = useState(() => sortByCreatedDesc(bookings));
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleStatusChange = useCallback(async (booking: BookingRecord, newStatus: string) => {
    setSavingId(booking.id);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Update failed');
      }
      setRows((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: newStatus as BookingRecord['status'] } : b)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setSavingId(null);
    }
  }, []);

  return (
    <AdminDataTable
      rows={rows}
      rowKey={(b) => b.id}
      pageSize={15}
      columns={[
        {
          key: 'client',
          header: 'Client',
          render: (b) => (
            <>
              <p className="fw-semibold mb-0">{b.clientName}</p>
              <p className="text-muted fs-12 mb-0">{b.clientEmail}</p>
            </>
          ),
        },
        { key: 'lawyer', header: 'Lawyer', render: (b) => b.lawyerName },
        {
          key: 'date',
          header: 'Date',
          render: (b) => (
            <>
              {b.date} · {b.time}
            </>
          ),
        },
        { key: 'type', header: 'Type', render: (b) => b.type },
        {
          key: 'status',
          header: 'Status',
          render: (b) => <StatusBadge status={b.status} />,
        },
      ]}
      renderActions={(b) => (
        <select
          className="form-select form-select-sm d-inline-block w-auto"
          value={b.status}
          disabled={savingId === b.id}
          onChange={(e) => handleStatusChange(b, e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      )}
    />
  );
}
