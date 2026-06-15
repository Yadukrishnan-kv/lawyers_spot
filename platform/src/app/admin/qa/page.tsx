import { AdminShell } from '@/components/admin/admin-shell';
import { QaManager } from '@/components/admin/qa-manager';
import { getAdminCmsData } from '@/lib/cms/store';

export default async function AdminQaPage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="Q&A"
      subtitle="Manage legal questions and answers"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Q&A' }]}
    >
      <QaManager initial={cms} />
    </AdminShell>
  );
}
