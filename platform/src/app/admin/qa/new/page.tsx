import Link from 'next/link';
import { AdminShell } from '@/components/admin/admin-shell';
import { QaEditForm } from '@/components/admin/qa-edit-form';
import { getAdminCmsData } from '@/lib/cms/store';
import { makeDefaultItem } from '@/components/admin/list-section-utils';

export default async function NewQaPage() {
  const cms = await getAdminCmsData();
  const post = makeDefaultItem('qaPosts', cms) as import('@/lib/cms/types').QaPost;

  return (
    <AdminShell
      title="Add Q&A"
      subtitle="Create a legal question post"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Q&A', href: '/admin/qa' },
        { label: 'New' },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/qa" className="text-decoration-none fs-12">
          ← Back to Q&A
        </Link>
      </p>
      <QaEditForm initial={cms} post={post} isNew />
    </AdminShell>
  );
}
