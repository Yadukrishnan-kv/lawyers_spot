import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { UserDashboardShell } from '@/components/dashboard/user-dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Heart, Bell, MessageSquare, FileText, Settings } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Dashboard' };

const nav = [
  { icon: Calendar, label: 'Consultations', href: '/dashboard' },
  { icon: Heart, label: 'Saved Lawyers', href: '/dashboard/saved' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function UserDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />
      <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">My Dashboard</h1>
      <UserDashboardShell>
      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        <aside className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </aside>
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent>
              <h2 className="font-bold">Upcoming Consultations</h2>
              <p className="mt-4 text-sm text-slate-500">No upcoming sessions. <Link href="/lawyers" className="text-royal-600">Book a lawyer</Link></p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h2 className="font-bold">Recent Activity</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Viewed Adv. Priya Sharma profile</li>
                <li>Saved article: Divorce by Mutual Consent</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      </UserDashboardShell>
    </div>
  );
}
