'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CmsData } from '@/lib/cms/types';
import { useCmsSave } from '@/components/admin/cms-editor';

type SettingsContextValue = {
  cms: CmsData;
  setCms: (cms: CmsData) => void;
  save: () => Promise<void>;
  saving: boolean;
  message: string;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ initial, children }: { initial: CmsData; children: ReactNode }) {
  const [cms, setCms] = useState(initial);
  const { save: persist, saving, message } = useCmsSave();

  async function save() {
    await persist(cms);
  }

  return (
    <SettingsContext.Provider value={{ cms, setCms, save, saving, message }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsCms() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsCms must be used within SettingsProvider');
  return ctx;
}
