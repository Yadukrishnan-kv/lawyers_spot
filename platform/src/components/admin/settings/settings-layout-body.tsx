'use client';

import { SaveBar } from '@/components/admin/cms-editor';
import { SettingsSubNav } from '@/components/admin/settings/settings-sub-nav';
import { useSettingsCms } from '@/components/admin/settings/settings-context';

export function SettingsLayoutBody({ children }: { children: React.ReactNode }) {
  const { save, saving, message } = useSettingsCms();

  return (
    <div className="row g-4">
      <div className="col-lg-3">
        <SettingsSubNav />
      </div>
      <div className="col-lg-9">
        {children}
        <SaveBar onSave={save} saving={saving} message={message} />
      </div>
    </div>
  );
}
