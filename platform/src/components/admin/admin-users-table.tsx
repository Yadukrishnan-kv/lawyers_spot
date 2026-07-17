'use client';

import { useMemo } from 'react';
import type { AdminUser } from '@/lib/cms/types';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import { sortByCreatedDesc } from '@/lib/admin/sort-utils';

export function AdminUsersTable({ users }: { users: AdminUser[] }) {
  const sorted = useMemo(() => sortByCreatedDesc(users), [users]);
  return (
    <AdminDataTable
      rows={sorted}
      rowKey={(u) => u.id}
      pageSize={10}
      showActions={false}
      columns={[
        { key: 'name', header: 'Name', render: (u) => <span className="fw-semibold">{u.name}</span> },
        { key: 'email', header: 'Email', render: (u) => u.email },
        {
          key: 'role',
          header: 'Role',
          render: (u) => (
            <span className="badge bg-primary-transparent text-primary capitalize">
              {u.role.replace('_', ' ')}
            </span>
          ),
        },
      ]}
    />
  );
}
