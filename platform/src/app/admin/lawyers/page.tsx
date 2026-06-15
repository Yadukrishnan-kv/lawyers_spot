import { AdminShell } from '@/components/admin/admin-shell';
import { LawyersManager } from '@/components/admin/lawyers-manager';
import { getAdminCmsData } from '@/lib/cms/store';

export const metadata = { title: 'lawyers | Admin' };

export default async function AdminLawyersPage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="Lawyers"
      subtitle="Add, edit, and verify advocates on the platform"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Lawyers' }]}
    >
      <LawyersManager initial={cms} />
    </AdminShell>
  );
}
