import { AdminShell } from '@/components/admin/admin-shell';
import { BookingsTable } from '@/components/admin/bookings-table';
import { getAdminCmsData } from '@/lib/cms/store';

export const metadata = { title: 'Bookings | Admin' };

export default async function AdminBookingsPage() {
  const cms = await getAdminCmsData();
  return (
    <AdminShell
      title="Bookings"
      subtitle="Consultation requests from the platform"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Bookings' }]}
    >
      <div className="card">
        <div className="card-header">
          <h3 className="card-title mb-0">All bookings</h3>
          <p className="text-muted mb-0 fs-12">{cms.bookings.length} total</p>
        </div>
        <div className="card-body">
          <BookingsTable bookings={cms.bookings} />
        </div>
      </div>
    </AdminShell>
  );
}
