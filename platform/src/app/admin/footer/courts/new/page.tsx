import Link from 'next/link';
import { AdminShell } from '@/components/admin/admin-shell';
import { CourtEditForm } from '@/components/admin/court-edit-form';
import { getAdminCmsData } from '@/lib/cms/store';

export default async function NewCourtPage() {
  const cms = await getAdminCmsData();
  const court = {
    slug: `court-${Date.now()}`,
    name: 'New Court',
    city: 'Delhi',
    body: '<p>Court description.</p>',
  };

  return (
    <AdminShell
      title="Add court"
      subtitle="Create a new court landing page"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Footer & Courts', href: '/admin/footer' },
        { label: 'Add court' },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/footer" className="text-decoration-none fs-12">
          ← Back to footer & courts
        </Link>
      </p>
      <CourtEditForm initial={cms} court={court} isNew backHref="/admin/footer" />
    </AdminShell>
  );
}
