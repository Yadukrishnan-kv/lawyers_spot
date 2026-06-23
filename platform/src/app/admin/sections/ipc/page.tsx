import { AdminShell } from '@/components/admin/admin-shell';
import { SectionsList } from '@/components/admin/sections-list';

export const metadata = { title: 'IPC Sections | Admin' };

export default function AdminIpcSectionsPage() {
  return (
    <AdminShell
      title="IPC Sections"
      subtitle="Manage Indian Penal Code sections"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Section', href: '#' },
        { label: 'IPC Section' },
      ]}
    >
      <SectionsList type="ipc" />
    </AdminShell>
  );
}
