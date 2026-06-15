import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { QaEditForm } from '@/components/admin/qa-edit-form';
import { getAdminCmsData } from '@/lib/cms/store';

type Props = { params: Promise<{ id: string }> };

export default async function EditQaPage({ params }: Props) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const cms = await getAdminCmsData();
  const post = cms.qaPosts.find((q) => q.id === decoded);
  if (!post) notFound();

  return (
    <AdminShell
      title={`Edit — ${post.title}`}
      subtitle="Q&A post content"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Q&A', href: '/admin/qa' },
        { label: post.title },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/qa" className="text-decoration-none fs-12">
          ← Back to Q&A
        </Link>
      </p>
      <QaEditForm initial={cms} post={post} />
    </AdminShell>
  );
}
