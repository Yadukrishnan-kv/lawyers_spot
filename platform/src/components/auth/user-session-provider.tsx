'use client';

import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchCurrentUser, logoutUser } from '@/lib/user-auth';

function isProtectedUserPath(pathname: string | null) {
  return Boolean(
    pathname?.startsWith('/lawyer-dashboard') || pathname?.startsWith('/dashboard'),
  );
}

function loginPathFor(pathname: string) {
  return pathname.startsWith('/lawyer-dashboard') ? '/lawyer-login' : '/login';
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  lawyerId?: string;
};

type UserSessionContextValue = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserSessionContext = createContext<UserSessionContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const current = await fetchCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Browser back/forward cache restores old React state — revalidate session on restore.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setLoading(true);
      void refresh();
    };
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  // If a protected page is shown without a valid session, redirect to login.
  useEffect(() => {
    if (loading || !isProtectedUserPath(pathname)) return;
    if (user) return;
    const login = loginPathFor(pathname!);
    const from = encodeURIComponent(pathname!);
    window.location.replace(`${login}?from=${from}`);
  }, [loading, user, pathname]);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    window.location.replace('/');
  }, []);

  return (
    <UserSessionContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  return useContext(UserSessionContext);
}
