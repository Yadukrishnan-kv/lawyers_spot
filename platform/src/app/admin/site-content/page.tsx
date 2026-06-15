import { AdminShell } from '@/components/admin/admin-shell';
import { SiteContentManager } from '@/components/admin/site-content-manager';
import { getAdminCmsData } from '@/lib/cms/store';

export default async function AdminSiteContentPage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="Site Content"
      subtitle="Navigation, hero, legal sections, courts, and SEO browse data"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Site Content' }]}
    >
      <SiteContentManager initial={cms} />
    </AdminShell>
  );
}
