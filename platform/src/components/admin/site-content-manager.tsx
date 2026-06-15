'use client';

import { useState } from 'react';
import type { CmsData, SiteContent } from '@/lib/cms/types';
import { SaveBar, useCmsSave } from '@/components/admin/cms-editor';

export function SiteContentManager({ initial }: { initial: CmsData }) {
  const [cms, setCms] = useState(initial);
  const [json, setJson] = useState(JSON.stringify(initial.siteContent, null, 2));
  const [parseError, setParseError] = useState('');
  const { save, saving, message } = useCmsSave();

  async function handleSave() {
    setParseError('');
    try {
      const siteContent = JSON.parse(json) as SiteContent;
      const next = { ...cms, siteContent };
      const ok = await save(next);
      if (ok) setCms(next);
    } catch {
      setParseError('Invalid JSON — fix syntax before saving');
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">Site content (navigation, hero, IPC, courts, guides)</h3>
      </div>
      <div className="card-body">
        <p className="text-muted small">
          Advanced JSON for navigation, hero, courts, acts, and other browse data. For About, Terms, Privacy, IPC,
          and BNS use <a href="/admin/cms-pages">CMS Pages</a> instead.
        </p>
        <textarea
          className="form-control font-monospace"
          rows={24}
          value={json}
          onChange={(e) => setJson(e.target.value)}
          spellCheck={false}
        />
        {parseError && <p className="text-danger small mt-2">{parseError}</p>}
      </div>
      <SaveBar onSave={handleSave} saving={saving} message={message} />
    </div>
  );
}
