import { AdminShell } from '@/components/admin/admin-shell';
import { SubscriptionsManager } from '@/components/admin/subscriptions-manager';
import { getAdminCmsData } from '@/lib/cms/store';

export default async function AdminSubscriptionsPage() {
  const cms = await getAdminCmsData();

  return (
    <AdminShell
      title="Subscriptions"
      subtitle="Manage plans and assign subscriptions to lawyers"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Subscriptions' },
      ]}
    >
      <SubscriptionsManager initial={cms} />
    </AdminShell>
  );
}
