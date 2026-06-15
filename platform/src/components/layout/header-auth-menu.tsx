'use client';

import Link from 'next/link';
import { LogOut, User } from 'lucide-react';
import { useUserSession } from '@/components/auth/user-session-provider';
import { cn } from '@/lib/utils';

export function HeaderAuthMenu({ className }: { className?: string }) {
  const { user, loading, logout } = useUserSession();

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
  const settingsHref = user.role === 'lawyer' ? '/lawyer-dashboard/settings' : '/dashboard';

  return (
    <div className={cn('flex items-center gap-3', className)}>
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
      <Link
        href={settingsHref}
        className="hidden text-xs font-bold uppercase tracking-wide text-slate-600 hover:text-royal-600 sm:inline"
      >
        Account
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
