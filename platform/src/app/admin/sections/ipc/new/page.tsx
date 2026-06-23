import Link from 'next/link';
import { AdminShell } from '@/components/admin/admin-shell';
import { SectionsForm } from '@/components/admin/sections-form';

export const metadata = { title: 'Create IPC Section | Admin' };

export default function CreateIpcSectionPage() {
  return (
    <AdminShell
      title="Create IPC Section"
      subtitle="Add a new IPC section"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Section', href: '/admin/sections/ipc' },
        { label: 'IPC Section', href: '/admin/sections/ipc' },
        { label: 'Create' },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/sections/ipc" className="text-decoration-none fs-12">
          ← Back to IPC Sections
        </Link>
      </p>
      <SectionsForm type="ipc" />
    </AdminShell>
  );
}
