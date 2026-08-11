import { AdminShell } from '@/components/admin/admin-shell';
import { ClientsTable } from '@/components/admin/clients-table';
import { getAdminClients } from '@/lib/cms/store';

export const metadata = { title: 'Clients | Admin' };

export default async function AdminClientsPage() {
  const clients = await getAdminClients();
  return (
    <AdminShell
      title="Clients"
      subtitle="Registered client accounts"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Clients' }]}
    >
      <div className="card">
        <div className="card-header">
          <h3 className="card-title mb-0">All clients</h3>
          <p className="text-muted mb-0 fs-12">{clients.length} total</p>
        </div>
        <div className="card-body">
          <ClientsTable clients={clients} />
        </div>
      </div>
    </AdminShell>
  );
}
