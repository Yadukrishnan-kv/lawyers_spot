'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, User, CreditCard, Settings, LogOut, FileText,
  MessageSquare, Mail, Scale, Menu, X, ChevronRight,
} from 'lucide-react';
import { fetchCurrentUser, logoutUser } from '@/lib/user-auth';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/lawyer-dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/lawyer-dashboard/profile', label: 'Edit Profile', icon: User },
  { href: '/lawyer-dashboard/messages', label: 'Messages', icon: Mail },
  { href: '/lawyer-dashboard/articles', label: 'Articles', icon: FileText },
  { href: '/lawyer-dashboard/qa', label: 'Q&A', icon: MessageSquare },
  { href: '/lawyer-dashboard/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/lawyer-dashboard/settings', label: 'Settings', icon: Settings },
];

export function LawyerDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (!u) {
        router.replace('/lawyer-login?from=' + encodeURIComponent(pathname));
        return;
      }
      setUser({ name: u.name, email: u.email });
      setLoading(false);
    });
  }, [pathname, router]);

  async function onLogout() {
    await logoutUser();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-slate-200/80 bg-white dark:border-navy-700 dark:bg-navy-900',
            'max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:w-full max-lg:border-r-0',
            sidebarOpen ? 'max-lg:block' : 'max-lg:hidden',
          )}
        >
          {sidebarOpen && (
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Brand */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-navy-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-royal-600 to-navy-800 text-white shadow-lg shadow-royal-600/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-navy-900 dark:text-white">LawyerSpot</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-royal-600 dark:text-royal-400">Lawyer Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV.map((item, i) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                    i === 0 && 'mt-2',
                    active
                      ? 'bg-royal-50 text-royal-700 shadow-sm dark:bg-royal-950/30 dark:text-royal-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-navy-800',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                      active
                        ? 'bg-royal-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-navy-800 dark:text-slate-400 dark:group-hover:bg-navy-700',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span>{item.label}</span>
                  {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-royal-500" />}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="border-t border-slate-100 px-3 py-3 dark:border-navy-700">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-navy-800 dark:text-slate-400">
                <LogOut className="h-4 w-4" />
              </div>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Area */}
        <div className="flex-1 lg:pl-64">
          <button
            type="button"
            className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 text-slate-600 shadow-md hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
