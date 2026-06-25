'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, User, MessageSquare } from 'lucide-react';
import { useUserSession } from '@/components/auth/user-session-provider';
import { cn } from '@/lib/utils';

type UnreadCounts = { userUnread: number; lawyerUnread: number };

export function HeaderAuthMenu({ className }: { className?: string }) {
  const { user, loading, logout } = useUserSession();
  const [unread, setUnread] = useState<UnreadCounts>({ userUnread: 0, lawyerUnread: 0 });

  useEffect(() => {
    if (!user) return;
    const role = user.role;
    async function fetchCounts() {
      try {
        const res = await fetch(role === 'lawyer' ? '/api/lawyer/conversations' : '/api/user/conversations', {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        const convs = data.conversations ?? [];
        const total = convs.reduce((sum: number, c: { unreadCount?: number }) => sum + (c.unreadCount ?? 0), 0);
        if (role === 'lawyer') {
          setUnread((prev) => ({ ...prev, lawyerUnread: total }));
        } else {
          setUnread((prev) => ({ ...prev, userUnread: total }));
        }
      } catch {}
    }
    fetchCounts();
    const id = setInterval(fetchCounts, 15000);
    return () => clearInterval(id);
  }, [user]);

  if (loading) {
    return <span className={cn('text-xs text-slate-400', className)}>…</span>;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          'text-xs font-bold uppercase tracking-wide text-slate-600 hover:text-royal-600 dark:text-slate-300',
          className,
        )}
      >
        Sign In
      </Link>
    );
  }

  const dashboardHref = user.role === 'lawyer' ? '/lawyer-dashboard' : '/dashboard';
  const messagesHref = user.role === 'lawyer' ? '/lawyer-dashboard/messages' : '/dashboard/messages';
  const totalUnread = user.role === 'lawyer' ? unread.lawyerUnread : unread.userUnread;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Link
        href={messagesHref}
        className="relative flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-600 hover:text-royal-600 dark:text-slate-300"
      >
        <MessageSquare className="h-4 w-4" />
        Messages
        {totalUnread > 0 && (
          <span className="absolute -right-2.5 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </Link>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
        <User className="h-4 w-4 text-royal-600" />
        <span className="max-w-[140px] truncate sm:max-w-[200px]">{user.name}</span>
      </div>
      <Link
        href={dashboardHref}
        className="text-xs font-bold uppercase tracking-wide text-royal-600 hover:text-royal-700"
      >
        Dashboard
      </Link>
      <button
        type="button"
        onClick={() => logout()}
        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-red-600"
      >
        <LogOut className="h-3.5 w-3.5" />
        Logout
      </button>
    </div>
  );
}
