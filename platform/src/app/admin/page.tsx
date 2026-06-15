import {
  Scale,
  FileText,
  MessageCircleQuestion,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/admin-shell';
import { StatCard } from '@/components/admin/stat-card';
import Link from 'next/link';
import { getAdminCmsData } from '@/lib/cms/store';
import { formatAdminTimestamp } from '@/lib/admin/format-timestamp';
import { planNameById } from '@/lib/subscription';

export const metadata = { title: 'Dashboard | Admin' };

export default async function AdminDashboardPage() {
  const cms = await getAdminCmsData();

  const quickLinks = [
    { href: '/admin/lawyers', label: 'Manage Lawyers', icon: Scale, count: cms.lawyers.length },
    { href: '/admin/articles', label: 'Articles', icon: FileText, count: cms.articles.length },
    { href: '/admin/qa', label: 'Q&A Posts', icon: MessageCircleQuestion, count: cms.qaPosts.length },
    { href: '/admin/bookings', label: 'Bookings', icon: Calendar, count: cms.bookings.length },
  ];

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Overview of your LawyerSpot marketplace"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Dashboard' }]}
    >
      <div className="row">
        <StatCard label="Lawyers" value={String(cms.lawyers.length)} change="+12% this month" icon={Scale} accent="royal" />
        <StatCard label="Articles" value={String(cms.articles.length)} change="+3 published" icon={FileText} accent="emerald" />
        <StatCard label="Q&A Posts" value={String(cms.qaPosts.length)} icon={MessageCircleQuestion} accent="amber" />
        <StatCard label="Bookings" value={String(cms.bookings.length)} change="2 pending" icon={Calendar} accent="violet" />
      </div>

      <div className="row row-sm mt-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Quick Actions</h3>
              <TrendingUp className="text-success" />
            </div>
            <div className="card-body">
              <div className="row g-3">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.href} className="col-sm-6">
                      <a href={item.href} className="card border shadow-none mb-0 text-decoration-none h-100">
                        <div className="card-body d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <span className="avatar avatar-md brround bg-primary-transparent text-primary d-flex align-items-center justify-content-center">
                              <Icon className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="fw-semibold text-dark mb-0">{item.label}</p>
                              <p className="text-muted fs-12 mb-0">{item.count} records</p>
                            </div>
                          </div>
                          <i className="fe fe-arrow-right text-muted" />
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title mb-0">Site Health</h3>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">CMS last updated</span>
                  <span className="fw-semibold">{formatAdminTimestamp(cms.updatedAt)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Practice areas</span>
                  <span className="text-success fw-semibold">{cms.practiceAreas.length} active</span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">States</span>
                  <span className="text-success fw-semibold">
                    {cms.states.filter((s) => s.active).length} / {cms.states.length} active
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Cities</span>
                  <span className="text-success fw-semibold">{cms.cities.length} listed</span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0 border-0">
                  <span className="text-muted">Verified lawyers</span>
                  <span className="text-success fw-semibold">
                    {cms.lawyers.filter((l) => l.verified).length}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row row-sm mt-4">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h3 className="card-title mb-0">Recent Lawyers</h3>
              <Link href="/admin/lawyers" className="btn btn-sm btn-outline-primary">
                View all ({cms.lawyers.length})
              </Link>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered text-nowrap border-bottom mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Plan</th>
                      <th>Rating</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cms.lawyers.slice(0, 8).map((l) => (
                      <tr key={l.id}>
                        <td className="fw-semibold">
                          <Link href={`/admin/lawyers/${encodeURIComponent(l.id)}/edit`} className="text-decoration-none">
                            {l.name}
                          </Link>
                          {l.topRated && (
                            <span className="badge bg-warning-subtle text-warning ms-1">Top Rated</span>
                          )}
                        </td>
                        <td>{l.location}</td>
                        <td>{planNameById(cms.subscriptionPlans ?? [], l.subscriptionPlanId)}</td>
                        <td>{l.rating}</td>
                        <td>
                          <span
                            className={`badge ${l.verified ? 'bg-success' : 'bg-secondary'}`}
                          >
                            {l.verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
