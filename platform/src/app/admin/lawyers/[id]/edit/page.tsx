import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { LawyerEditPage } from '@/components/admin/lawyer-edit-page';
import { getAdminCmsData } from '@/lib/cms/store';

type Props = { params: Promise<{ id: string }> };

export default async function AdminLawyerEditPage({ params }: Props) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const cms = await getAdminCmsData();
  const lawyer = cms.lawyers.find((l) => l.id === decoded);
  if (!lawyer) notFound();

  return (
    <AdminShell
      title={`Edit — ${lawyer.name}`}
      subtitle="Full lawyer profile"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Lawyers', href: '/admin/lawyers' },
        { label: lawyer.name },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/lawyers" className="text-decoration-none fs-12">
          ← Back to lawyers
        </Link>
      </p>
      <LawyerEditPage initial={cms} lawyer={lawyer} />
    </AdminShell>
  );
}
