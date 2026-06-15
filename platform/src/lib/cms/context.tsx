'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { PublicCmsData } from './public-types';

const CmsContext = createContext<PublicCmsData | null>(null);

export function CmsProvider({ data, children }: { data: PublicCmsData; children: ReactNode }) {
  return <CmsContext.Provider value={data}>{children}</CmsContext.Provider>;
}

export function useCms(): PublicCmsData {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error('useCms must be used within CmsProvider');
  return ctx;
}
