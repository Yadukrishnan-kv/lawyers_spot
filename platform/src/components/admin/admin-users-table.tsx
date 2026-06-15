'use client';

import type { AdminUser } from '@/lib/cms/types';
import { AdminDataTable } from '@/components/admin/admin-data-table';

export function AdminUsersTable({ users }: { users: AdminUser[] }) {
  return (
    <AdminDataTable
      rows={users}
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
