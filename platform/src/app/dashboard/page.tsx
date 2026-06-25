'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Bell, MessageSquare, Scale, ArrowRight, Gavel } from 'lucide-react';
import { fetchUserBookings, fetchNotifications, fetchConversations } from '@/lib/user-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardOverviewPage() {
  const [bookings, setBookings] = useState<Array<{ id: string; lawyerName: string; date: string; time: string; status: string }>>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [convCount, setConvCount] = useState(0);

  useEffect(() => {
    fetchUserBookings().then((d) => setBookings(d.bookings)).catch(() => {});
    fetchNotifications().then((d) => setUnreadNotifs(d.notifications.filter((n) => !n.read).length)).catch(() => {});
    fetchConversations().then((d) => setConvCount(d.conversations.length)).catch(() => {});
  }, []);

  const upcoming = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').slice(0, 5);

  const stats = [
    { icon: Calendar, label: 'Total Consultations', value: bookings.length, color: 'from-royal-600 to-blue-700', bg: 'bg-royal-50 dark:bg-royal-950/30', iconBg: 'bg-royal-600' },
    { icon: Bell, label: 'Unread Notifications', value: unreadNotifs, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-950/30', iconBg: 'bg-amber-500' },
    { icon: MessageSquare, label: 'Active Conversations', value: convCount, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', iconBg: 'bg-emerald-500' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-royal-800 p-6 sm:p-8">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
                <Gavel className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Client Dashboard</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Your Legal Hub
            </h2>
            <p className="mt-2 max-w-lg text-sm text-white/70">
              Manage consultations, messages, documents, and more — all in one place.
            </p>
          </div>
          <Button asChild className="shrink-0 border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
            <Link href="/lawyers">
              <Scale className="h-4 w-4" />
              Find a Lawyer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-premium">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} text-white shadow-lg`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
              <div className={`mt-4 h-1 w-full rounded-full ${stat.bg}`}>
                <div
                  className={`h-1 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                  style={{ width: `${Math.min((stat.value / 10) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-navy-700 dark:bg-navy-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal-100 text-royal-600 dark:bg-royal-950/40 dark:text-royal-300">
                <Calendar className="h-4 w-4" />
              </div>
              <h3 className="font-display text-base font-bold text-navy-900 dark:text-white">Upcoming Consultations</h3>
            </div>
            {upcoming.length > 0 && (
              <Link
                href="/dashboard/consultations"
                className="text-xs font-semibold text-royal-600 hover:text-royal-500 dark:text-royal-400"
              >
                View All
              </Link>
            )}
          </div>
        </div>
        <CardContent className="p-6">
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-800">
                <Calendar className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900 dark:text-white">No upcoming consultations</p>
                <p className="mt-1 text-xs text-slate-500">Browse lawyers and book your first consultation.</p>
              </div>
              <Button asChild>
                <Link href="/lawyers">
                  <Scale className="h-4 w-4" />
                  Book a Consultation
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-navy-700">
              {upcoming.map((b) => (
                <div key={b.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-royal-50 text-royal-600 dark:bg-royal-950/40 dark:text-royal-300">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{b.lawyerName}</p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.date} at {b.time}</span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {b.status}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-slate-300" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}
