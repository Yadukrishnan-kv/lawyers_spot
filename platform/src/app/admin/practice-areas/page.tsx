import { AdminShell } from '@/components/admin/admin-shell';
import { PracticeAreasManager } from '@/components/admin/practice-areas-manager';
import { getAdminCmsData } from '@/lib/cms/store';

export default async function AdminPracticePage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="Practice Areas"
      subtitle="Manage practice area categories"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Practice Areas' }]}
    >
      <PracticeAreasManager initial={cms} />
    </AdminShell>
  );
}
