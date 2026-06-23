import { AdminShell } from '@/components/admin/admin-shell';
import { SectionsList } from '@/components/admin/sections-list';

export const metadata = { title: 'BNS Sections | Admin' };

export default function AdminBnsSectionsPage() {
  return (
    <AdminShell
      title="BNS Sections"
      subtitle="Manage Bharatiya Nyaya Sanhita sections"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Section', href: '#' },
        { label: 'BNS Section' },
      ]}
    >
      <SectionsList type="bns" />
    </AdminShell>
  );
}
