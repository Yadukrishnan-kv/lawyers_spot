'use client';

import type { EmailSmtpSettings } from '@/lib/cms/types';
import { AdminInput } from '@/components/admin/cms-editor';
import { useSettingsCms } from '@/components/admin/settings/settings-context';

function patchEmail(cms: ReturnType<typeof useSettingsCms>['cms'], patch: Partial<EmailSmtpSettings>) {
  return {
    ...cms,
    siteContent: {
      ...cms.siteContent,
      integrations: {
        ...cms.siteContent.integrations,
        email: { ...cms.siteContent.integrations.email, ...patch },
      },
    },
  };
}

export function EmailSettingsForm() {
  const { cms, setCms } = useSettingsCms();
  const email = cms.siteContent.integrations.email;

  return (
    <div className="card">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h3 className="card-title mb-0">Email SMTP</h3>
          <p className="text-muted mb-0 fs-12">Outgoing mail for bookings, notifications, and alerts</p>
        </div>
        <label className="form-check form-switch mb-0">
          <input
            type="checkbox"
            className="form-check-input"
            checked={email.enabled}
            onChange={(e) => setCms(patchEmail(cms, { enabled: e.target.checked }))}
          />
          <span className="form-check-label">Enabled</span>
        </label>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-8">
            <AdminInput
              label="SMTP host"
              value={email.host}
              onChange={(v) => setCms(patchEmail(cms, { host: v }))}
              placeholder="smtp.gmail.com"
            />
          </div>
          <div className="col-md-4">
            <AdminInput
              label="Port"
              value={String(email.port)}
              onChange={(v) => setCms(patchEmail(cms, { port: parseInt(v, 10) || 587 }))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-check mt-4">
              <input
                type="checkbox"
                className="form-check-input"
                checked={email.secure}
                onChange={(e) => setCms(patchEmail(cms, { secure: e.target.checked }))}
              />
              <span className="form-check-label">Use TLS/SSL (secure)</span>
            </label>
          </div>
          <div className="col-md-6">
            <AdminInput
              label="Username"
              value={email.username}
              onChange={(v) => setCms(patchEmail(cms, { username: v }))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={email.password}
              onChange={(e) => setCms(patchEmail(cms, { password: e.target.value }))}
              autoComplete="new-password"
              placeholder="SMTP password or app password"
            />
          </div>
          <div className="col-md-6">
            <AdminInput
              label="From email"
              value={email.fromEmail}
              onChange={(v) => setCms(patchEmail(cms, { fromEmail: v }))}
            />
          </div>
          <div className="col-md-6">
            <AdminInput
              label="From name"
              value={email.fromName}
              onChange={(v) => setCms(patchEmail(cms, { fromName: v }))}
            />
          </div>
        </div>
        <p className="text-muted fs-12 mt-3 mb-0">
          Credentials are stored in your CMS database. Use app-specific passwords where possible.
        </p>
      </div>
    </div>
  );
}
