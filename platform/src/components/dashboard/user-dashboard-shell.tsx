'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCurrentUser, logoutUser } from '@/lib/user-auth';
import { Button } from '@/components/ui/button';

export function UserDashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (u) setUser({ name: u.name, email: u.email });
    });
  }, []);

  async function onLogout() {
    await logoutUser();
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {user && (
          <p className="text-sm text-slate-600">
            Signed in as <strong>{user.name}</strong> ({user.email})
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/lawyers">Find lawyers</Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={onLogout}>
            Sign out
          </Button>
        </div>
      </div>
      {children}
    </>
  );
}
