import { AdminShell } from '@/components/admin/admin-shell';
import { AdminUsersTable } from '@/components/admin/admin-users-table';
import { getAdminCmsData } from '@/lib/cms/store';

export const metadata = { title: 'Admin Users | Admin' };

export default async function AdminUsersPage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="Admin Users"
      subtitle="Platform administrators and roles"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]}
    >
      <div className="card">
        <div className="card-header">
          <h3 className="card-title mb-0">Administrators</h3>
        </div>
        <div className="card-body">
          <AdminUsersTable users={cms.adminUsers} />
        </div>
      </div>
      <p className="text-muted mt-3 fs-12">
        Login credentials are configured via ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
      </p>
    </AdminShell>
  );
}
