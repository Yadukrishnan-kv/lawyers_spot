import Link from 'next/link';
import { AdminShell } from '@/components/admin/admin-shell';
import { CmsPageEditor } from '@/components/admin/cms-page-editor';
import { getAdminCmsData } from '@/lib/cms/store';

export default async function NewCmsPagePage() {
  const cms = await getAdminCmsData();

  return (
    <AdminShell
      title="Add CMS page"
      subtitle="Create a new custom content page"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'CMS Pages', href: '/admin/cms-pages' },
        { label: 'New' },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/cms-pages" className="text-decoration-none fs-12">
          ← Back to CMS pages
        </Link>
      </p>
      <CmsPageEditor initial={cms} pageId="new" isNew />
    </AdminShell>
  );
}
