import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { SectionsForm } from '@/components/admin/sections-form';
import { getBackendUrl } from '@/lib/cms/backend-url';
import { cookies } from 'next/headers';
import type { SectionRecord } from '@/lib/sections-data';

type Props = { params: Promise<{ id: string }> };

async function getSection(id: string): Promise<SectionRecord | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');
    const res = await fetch(`${getBackendUrl()}/api/v1/admin/sections/${id}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      return (await res.json()) as SectionRecord;
    }
  } catch {
    /* fallback */
  }
  return null;
}

export default async function EditIpcSectionPage({ params }: Props) {
  const { id } = await params;
  const section = await getSection(id);

  if (!section || section.type !== 'ipc') {
    notFound();
  }

  return (
    <AdminShell
      title={`Edit — ${section.title}`}
      subtitle="Update IPC section details"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Section', href: '/admin/sections/ipc' },
        { label: 'IPC Section', href: '/admin/sections/ipc' },
        { label: section.title },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/sections/ipc" className="text-decoration-none fs-12">
          ← Back to IPC Sections
        </Link>
      </p>
      <SectionsForm type="ipc" initial={section} />
    </AdminShell>
  );
}
