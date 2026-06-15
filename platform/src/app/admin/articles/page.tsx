import { AdminShell } from '@/components/admin/admin-shell';
import { ArticlesManager } from '@/components/admin/articles-manager';
import { getAdminCmsData } from '@/lib/cms/store';

export default async function AdminArticlesPage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="Articles"
      subtitle="Manage knowledge center articles"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Articles' }]}
    >
      <ArticlesManager initial={cms} />
    </AdminShell>
  );
}
