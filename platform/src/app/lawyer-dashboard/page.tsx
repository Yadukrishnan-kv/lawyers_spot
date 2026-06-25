import { LawyerVerificationPanel } from '@/components/lawyer/lawyer-verification-panel';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Users, Calendar, TrendingUp, Star, MessageSquare, Clock, ArrowRight, FileText, HelpCircle, User } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Overview</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your profile, clients, and practice.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-royal-50 text-royal-600 dark:bg-royal-950/30 dark:text-royal-300">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-navy-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/lawyer-dashboard/messages" icon={MessageSquare} label="Messages" desc="Reply to client messages" />
        <QuickLink href="/lawyer-dashboard/profile" icon={User} label="Edit Profile" desc="Update your practice details" />
        <QuickLink href="/lawyer-dashboard/articles" icon={FileText} label="Articles" desc="Publish legal articles" />
        <QuickLink href="/lawyer-dashboard/qa" icon={HelpCircle} label="Q&A" desc="Answer legal questions" />
      </div>

      {/* Verification Panel */}
      <LawyerVerificationPanel />

      {/* Bottom Section */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">Client Chats</p>
                  <p className="text-xs text-slate-500">3 unread messages</p>
                </div>
              </div>
              <Link
                href="/lawyer-dashboard/messages"
                className="text-xs font-medium text-royal-600 hover:text-royal-500"
              >
                View <ArrowRight className="ml-0.5 inline h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">Availability</p>
                  <p className="text-xs text-slate-500">Mon–Fri, 10 AM – 6 PM</p>
                </div>
              </div>
              <Link
                href="/lawyer-dashboard/settings"
                className="text-xs font-medium text-royal-600 hover:text-royal-500"
              >
                Edit <ArrowRight className="ml-0.5 inline h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, desc }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; desc: string }) {
  return (
    <Link href={href} className="group block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-royal-200 hover:shadow-sm dark:border-navy-700 dark:bg-navy-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal-50 text-royal-600 dark:bg-royal-950/30 dark:text-royal-300">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm font-semibold text-navy-900 group-hover:text-royal-600 dark:text-white">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
    </Link>
  );
}
