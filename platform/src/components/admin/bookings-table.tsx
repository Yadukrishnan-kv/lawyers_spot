'use client';

import type { BookingRecord } from '@/lib/cms/types';
import { AdminDataTable } from '@/components/admin/admin-data-table';

export function BookingsTable({ bookings }: { bookings: BookingRecord[] }) {
  return (
    <AdminDataTable
      rows={bookings}
      rowKey={(b) => b.id}
      pageSize={15}
      showActions={false}
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
          render: (b) => (
            <span className="badge bg-success-transparent text-success capitalize">{b.status}</span>
          ),
        },
      ]}
    />
  );
}
