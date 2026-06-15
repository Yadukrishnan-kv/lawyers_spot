'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminLayoutProvider } from '@/components/admin/admin-layout-context';
import { AdminPersistentShell } from '@/components/admin/admin-persistent-shell';

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    document.body.classList.add('admin-theme-active');
    document.body.classList.remove('font-sans');
    if (!isLogin) {
      const classes = ['app', 'sidebar-mini', 'ltr', 'light-mode'];
      for (const c of classes) {
        if (!document.body.classList.contains(c)) document.body.classList.add(c);
      }
    }
    return () => {
      document.body.classList.remove('admin-theme-active');
      if (!document.body.classList.contains('font-sans')) {
        document.body.classList.add('font-sans');
      }
    };
  }, [isLogin]);

  if (isLogin) {
    return <AdminLayoutProvider enabled={false}>{children}</AdminLayoutProvider>;
  }

  return (
    <AdminLayoutProvider enabled>
      <AdminPersistentShell>{children}</AdminPersistentShell>
    </AdminLayoutProvider>
  );
}
