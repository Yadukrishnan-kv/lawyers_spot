import { AdminShell } from '@/components/admin/admin-shell';
import { StatesManager } from '@/components/admin/states-manager';
import { getAdminCmsData } from '@/lib/cms/store';

export const metadata = { title: 'State Master | Admin' };

export default async function AdminStatesPage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="State Master"
      subtitle="Manage Indian states and union territories used across cities and SEO pages"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'State Master' }]}
    >
      <StatesManager initial={cms} />
    </AdminShell>
  );
}
