'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Info, CalendarCheck, CalendarX, UserCheck, UserX, Megaphone } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/user-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const typeIcons: Record<string, typeof Bell> = {
  booking_confirmed: CalendarCheck,
  booking_cancelled: CalendarX,
  lawyer_accepted: UserCheck,
  lawyer_rejected: UserX,
  system: Megaphone,
  info: Info,
};

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications()
      .then((data) => setNotifications(data.notifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkRead(id: number) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">Notifications</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Stay updated with your legal matters</p>
          </div>
        </div>
        {notifications.some((n) => !n.read) && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-800">
              <Bell className="h-6 w-6 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-navy-900 dark:text-white">No notifications yet</p>
              <p className="mt-1 text-xs text-slate-500">We'll notify you when something important happens.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] ?? Info;
            return (
              <button
                type="button"
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={cn(
                  'flex w-full items-start gap-4 rounded-xl border p-4 text-left transition hover:shadow-sm',
                  n.read
                    ? 'border-slate-100 bg-white dark:border-navy-700 dark:bg-navy-900'
                    : 'border-royal-100 bg-royal-50/50 shadow-sm dark:border-royal-900/50 dark:bg-royal-950/20',
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    n.read
                      ? 'bg-slate-100 text-slate-400 dark:bg-navy-800'
                      : 'bg-royal-100 text-royal-600 dark:bg-royal-900/50 dark:text-royal-300',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        n.read
                          ? 'text-slate-600 dark:text-slate-400'
                          : 'text-navy-900 dark:text-white',
                      )}
                    >
                      {n.title}
                    </p>
                    <span className="shrink-0 whitespace-nowrap text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{n.message}</p>
                </div>
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-royal-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
