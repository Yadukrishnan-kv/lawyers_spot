'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Bell, MessageSquare } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal-50 text-royal-600 dark:bg-royal-950/30 dark:text-royal-300">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900 dark:text-white">{bookings.length}</p>
              <p className="text-xs text-slate-500">Total Consultations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900 dark:text-white">{unreadNotifs}</p>
              <p className="text-xs text-slate-500">Unread Notifications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900 dark:text-white">{convCount}</p>
              <p className="text-xs text-slate-500">Conversations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-bold text-navy-900 dark:text-white">Upcoming Consultations</h2>
          {upcoming.length === 0 ? (
            <div className="text-center">
              <p className="text-sm text-slate-500">No upcoming sessions.</p>
              <Button asChild className="mt-3 bg-royal-600 hover:bg-royal-500">
                <Link href="/lawyers">Book a Lawyer</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 dark:border-navy-700"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{b.lawyerName}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{b.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.time}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {b.status}
                  </span>
                </div>
              ))}
              <Link href="/dashboard/consultations" className="block text-center text-sm font-medium text-royal-600 hover:text-royal-500">
                View all consultations
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
