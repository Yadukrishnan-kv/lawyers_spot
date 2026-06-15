import { AdminShell } from '@/components/admin/admin-shell';
import { CitiesManager } from '@/components/admin/cities-manager';
import { getAdminCmsData } from '@/lib/cms/store';

export const metadata = { title: 'Cities | Admin' };

export default async function AdminCitiesPage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="Cities"
      subtitle="Manage city landing pages — state is chosen from State Master"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Cities' }]}
    >
      <CitiesManager initial={cms} />
    </AdminShell>
  );
}
