'use client';

import { usePathname } from 'next/navigation';
import { UserSessionProvider } from '@/components/auth/user-session-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/lawyer-dashboard');

  if (isAdmin || isDashboard) {
    return (
      <UserSessionProvider>
        <Header />
        <main className="min-h-screen">{children}</main>
      </UserSessionProvider>
    );
  }

  return (
    <UserSessionProvider>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </UserSessionProvider>
  );
}
