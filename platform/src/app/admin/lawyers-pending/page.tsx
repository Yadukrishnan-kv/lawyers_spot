import { AdminShell } from '@/components/admin/admin-shell';
import { PendingLawyersManager } from '@/components/admin/pending-lawyers-manager';

export const metadata = { title: 'Lawyers Pending | Admin' };

export default function AdminLawyersPendingPage() {
  return (
    <AdminShell
      title="Lawyers Pending"
      subtitle="Import, review, and verify lawyers before adding them to the platform"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Lawyers Pending' }]}
    >
      <PendingLawyersManager />
    </AdminShell>
  );
}
