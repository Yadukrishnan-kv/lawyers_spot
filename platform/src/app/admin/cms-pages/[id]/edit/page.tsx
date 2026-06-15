import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { CmsPageEditor } from '@/components/admin/cms-page-editor';
import { findCmsPageRow, findSystemPageDef, findCustomPage } from '@/lib/admin/cms-pages-registry';
import { getAdminCmsData } from '@/lib/cms/store';

type Props = { params: Promise<{ id: string }> };

export default async function EditCmsPagePage({ params }: Props) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const cms = await getAdminCmsData();
  const row = findCmsPageRow(cms.siteContent, decoded);
  if (!row && !findSystemPageDef(decoded) && !findCustomPage(cms.siteContent, decoded)) {
    notFound();
  }

  const title = row?.title ?? decoded;

  return (
    <AdminShell
      title={`Edit — ${title}`}
      subtitle="Page content and SEO"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'CMS Pages', href: '/admin/cms-pages' },
        { label: title },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/cms-pages" className="text-decoration-none fs-12">
          ← Back to CMS pages
        </Link>
      </p>
      <CmsPageEditor initial={cms} pageId={decoded} />
    </AdminShell>
  );
}
