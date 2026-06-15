'use client';

import { AdminInput } from '@/components/admin/cms-editor';
import { useSettingsCms } from '@/components/admin/settings/settings-context';

export function GeneralSettingsForm() {
  const { cms, setCms } = useSettingsCms();

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">General Settings</h3>
        <p className="text-muted mb-0 fs-12">Branding, SEO, and homepage statistics</p>
      </div>
      <div className="card-body">
        <h5 className="mb-3">Site configuration</h5>
        <div className="row g-3">
          <div className="col-12">
            <AdminInput
              label="Site name"
              value={cms.siteConfig.name}
              onChange={(v) => setCms({ ...cms, siteConfig: { ...cms.siteConfig, name: v } })}
            />
          </div>
          <div className="col-12">
            <AdminInput
              label="Tagline"
              value={cms.siteConfig.tagline}
              onChange={(v) => setCms({ ...cms, siteConfig: { ...cms.siteConfig, tagline: v } })}
            />
          </div>
          <div className="col-12">
            <AdminInput
              label="URL"
              value={cms.siteConfig.url}
              onChange={(v) => setCms({ ...cms, siteConfig: { ...cms.siteConfig, url: v } })}
            />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              value={cms.siteConfig.description}
              onChange={(e) =>
                setCms({ ...cms, siteConfig: { ...cms.siteConfig, description: e.target.value } })
              }
              rows={3}
              className="form-control"
            />
          </div>
        </div>

        <hr className="my-4" />
        <h5 className="mb-3">Homepage stats</h5>
        {cms.stats.map((stat, i) => (
          <div key={i} className="row g-3 mb-3">
            <div className="col-md-6">
              <AdminInput
                label="Label"
                value={stat.label}
                onChange={(v) => {
                  const stats = [...cms.stats];
                  stats[i] = { ...stat, label: v };
                  setCms({ ...cms, stats });
                }}
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="Value"
                value={stat.value}
                onChange={(v) => {
                  const stats = [...cms.stats];
                  stats[i] = { ...stat, value: v };
                  setCms({ ...cms, stats });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
