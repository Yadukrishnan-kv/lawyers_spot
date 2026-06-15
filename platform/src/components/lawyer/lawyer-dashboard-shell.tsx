'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, CreditCard, Settings, LogOut, FileText, MessageSquare } from 'lucide-react';
import { useUserSession } from '@/components/auth/user-session-provider';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/lawyer-dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/lawyer-dashboard/profile', label: 'Edit Profile', icon: User },
  { href: '/lawyer-dashboard/articles', label: 'Articles', icon: FileText },
  { href: '/lawyer-dashboard/qa', label: 'Q&A', icon: MessageSquare },
  { href: '/lawyer-dashboard/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/lawyer-dashboard/settings', label: 'Change Password', icon: Settings },
];

export function LawyerDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useUserSession();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-royal-600">Lawyer Dashboard</p>
          <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white">
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-1 text-slate-600">Manage profile, articles, Q&amp;A replies, and subscription</p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-red-200 hover:text-red-600 dark:border-navy-700"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 dark:border-navy-800 dark:bg-navy-900">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                    active
                      ? 'bg-royal-500/10 text-royal-700 dark:text-royal-300'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-navy-800',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
