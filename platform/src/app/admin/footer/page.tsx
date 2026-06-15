import { AdminShell } from '@/components/admin/admin-shell';
import { FooterManager } from '@/components/admin/footer-manager';
import { getAdminCmsData } from '@/lib/cms/store';

export default async function AdminFooterPage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="Footer & Courts"
      subtitle="Footer sections, court pages, popular searches, and bottom links"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Footer & Courts' }]}
    >
      <FooterManager initial={cms} />
    </AdminShell>
  );
}
