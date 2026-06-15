import { AdminShell } from '@/components/admin/admin-shell';
import { StatCard } from '@/components/admin/stat-card';
import { BarChart3, Eye, Users, MousePointer } from 'lucide-react';
import { getAdminCmsData } from '@/lib/cms/store';

export const metadata = { title: 'Analytics | Admin' };

export default async function AdminAnalyticsPage() {
  const cms = await getAdminCmsData();
  const totalViews = cms.qaPosts.reduce((s, q) => s + q.views, 0);

  return (
    <AdminShell
      title="Analytics"
      subtitle="Traffic and engagement overview"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Analytics' }]}
    >
      <div className="row">
        <StatCard label="Page views (Q&A)" value={totalViews.toLocaleString()} icon={Eye} accent="royal" />
        <StatCard label="Active lawyers" value={String(cms.lawyers.length)} icon={Users} accent="emerald" />
        <StatCard label="Published articles" value={String(cms.articles.length)} icon={BarChart3} accent="amber" />
        <StatCard
          label="Conversion est."
          value="4.2%"
          change="Bookings / visits"
          icon={MousePointer}
          accent="violet"
        />
      </div>
      <div className="card mt-4">
        <div className="card-body text-center py-5">
          <BarChart3 className="mx-auto mb-3 text-muted" size={48} />
          <p className="text-muted mb-1">Connect Google Analytics or Plausible for live charts.</p>
          <p className="text-muted fs-12 mb-0">CMS-driven metrics above update when you edit content.</p>
        </div>
      </div>
    </AdminShell>
  );
}
