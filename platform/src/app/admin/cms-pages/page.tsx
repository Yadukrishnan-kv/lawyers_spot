import { AdminShell } from '@/components/admin/admin-shell';
import { CmsPagesManager } from '@/components/admin/cms-pages-manager';
import { getAdminCmsData } from '@/lib/cms/store';

export const metadata = { title: 'CMS Pages | Admin' };

export default async function AdminCmsPagesPage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="CMS Pages"
      subtitle="List and manage all public content pages"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'CMS Pages' }]}
    >
      <CmsPagesManager initial={cms} />
    </AdminShell>
  );
}
