'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Heart,
  Bell,
  MessageSquare,
  FileText,
  Settings,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { fetchCurrentUser, logoutUser } from '@/lib/user-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const nav = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Calendar, label: 'Consultations', href: '/dashboard/consultations' },
  { icon: Heart, label: 'Saved Lawyers', href: '/dashboard/saved-lawyers' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (!u) {
        router.replace('/login?from=' + encodeURIComponent(pathname));
        return;
      }
      setUser({ name: u.name, email: u.email, role: u.role });
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">My Dashboard</h1>
          {user && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Signed in as <strong>{user.name}</strong> ({user.email})
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/lawyers">Find lawyers</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Sign out
          </Button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-8">
        <aside
          className={cn(
            'w-64 shrink-0 space-y-1',
            'max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:w-full max-lg:bg-white max-lg:p-6 max-lg:pt-20 dark:max-lg:bg-navy-900',
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
          {nav.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-royal-50 text-royal-700 dark:bg-royal-950/30 dark:text-royal-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-navy-800',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
          <div className="border-t border-slate-200 pt-2 dark:border-navy-700">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Sign out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
