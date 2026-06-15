import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { CourtEditForm } from '@/components/admin/court-edit-form';
import { getAdminCmsData } from '@/lib/cms/store';

type Props = { params: Promise<{ slug: string }> };

export default async function EditCourtPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const cms = await getAdminCmsData();
  const court = cms.siteContent.courts.find((c) => c.slug === decoded);
  if (!court) notFound();

  return (
    <AdminShell
      title={`Edit — ${court.name}`}
      subtitle="Court page content and SEO"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Footer & Courts', href: '/admin/footer' },
        { label: court.name },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/footer" className="text-decoration-none fs-12">
          ← Back to footer & courts
        </Link>
      </p>
      <CourtEditForm initial={cms} court={court} backHref="/admin/footer" />
    </AdminShell>
  );
}
