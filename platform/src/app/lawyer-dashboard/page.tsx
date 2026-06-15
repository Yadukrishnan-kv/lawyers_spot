import { LawyerVerificationPanel } from '@/components/lawyer/lawyer-verification-panel';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Users, Calendar, TrendingUp, Star, MessageSquare, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Lawyer Dashboard' };

const stats = [
  { icon: Users, label: 'New Leads', value: '24' },
  { icon: Calendar, label: 'Appointments', value: '12' },
  { icon: TrendingUp, label: 'Earnings (MTD)', value: '₹1.2L' },
  { icon: Star, label: 'Rating', value: '4.9' },
];

export default function LawyerDashboardPage() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-royal-500/10 text-royal-600">
                <s.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-2xl font-bold text-navy-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/lawyer-dashboard/profile"
          className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-royal-600 hover:border-royal-200 dark:border-navy-800 dark:bg-navy-900"
        >
          Edit profile →
        </Link>
        <Link
          href="/lawyer-dashboard/articles"
          className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-royal-600 hover:border-royal-200 dark:border-navy-800 dark:bg-navy-900"
        >
          Write articles →
        </Link>
        <Link
          href="/lawyer-dashboard/qa"
          className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-royal-600 hover:border-royal-200 dark:border-navy-800 dark:bg-navy-900"
        >
          Answer Q&amp;A →
        </Link>
        <Link
          href="/lawyer-dashboard/subscription"
          className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-royal-600 hover:border-royal-200 dark:border-navy-800 dark:bg-navy-900"
        >
          Manage subscription →
        </Link>
        <Link
          href="/lawyer-dashboard/settings"
          className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-royal-600 hover:border-royal-200 dark:border-navy-800 dark:bg-navy-900"
        >
          Change password →
        </Link>
      </div>

      <div className="mt-8">
        <LawyerVerificationPanel />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 font-bold">
              <MessageSquare className="h-5 w-5" /> Client Chats
            </h2>
            <p className="mt-4 text-sm text-slate-500">3 unread messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 font-bold">
              <Clock className="h-5 w-5" /> Availability
            </h2>
            <p className="mt-4 text-sm text-slate-500">Mon–Fri, 10 AM – 6 PM</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
