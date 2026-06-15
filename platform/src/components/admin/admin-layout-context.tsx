'use client';

import { createContext, useContext, type ReactNode } from 'react';

const AdminLayoutContext = createContext(false);

export function AdminLayoutProvider({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  return <AdminLayoutContext.Provider value={enabled}>{children}</AdminLayoutContext.Provider>;
}

export function useAdminLayout(): boolean {
  return useContext(AdminLayoutContext);
}
