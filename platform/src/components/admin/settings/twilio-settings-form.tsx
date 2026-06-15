'use client';

import type { TwilioSettings } from '@/lib/cms/types';
import { AdminInput } from '@/components/admin/cms-editor';
import { useSettingsCms } from '@/components/admin/settings/settings-context';

function patchTwilio(cms: ReturnType<typeof useSettingsCms>['cms'], patch: Partial<TwilioSettings>) {
  return {
    ...cms,
    siteContent: {
      ...cms.siteContent,
      integrations: {
        ...cms.siteContent.integrations,
        twilio: { ...cms.siteContent.integrations.twilio, ...patch },
      },
    },
  };
}

export function TwilioSettingsForm() {
  const { cms, setCms } = useSettingsCms();
  const twilio = cms.siteContent.integrations.twilio;

  return (
    <div className="card">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h3 className="card-title mb-0">Twilio SMS</h3>
          <p className="text-muted mb-0 fs-12">Booking reminders and OTP via SMS</p>
        </div>
        <label className="form-check form-switch mb-0">
          <input
            type="checkbox"
            className="form-check-input"
            checked={twilio.enabled}
            onChange={(e) => setCms(patchTwilio(cms, { enabled: e.target.checked }))}
          />
          <span className="form-check-label">Enabled</span>
        </label>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <AdminInput
              label="Account SID"
              value={twilio.accountSid}
              onChange={(v) => setCms(patchTwilio(cms, { accountSid: v }))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Auth token</label>
            <input
              type="password"
              className="form-control"
              value={twilio.authToken}
              onChange={(e) => setCms(patchTwilio(cms, { authToken: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
          <div className="col-md-6">
            <AdminInput
              label="From phone number"
              value={twilio.fromNumber}
              onChange={(v) => setCms(patchTwilio(cms, { fromNumber: v }))}
              placeholder="+91XXXXXXXXXX"
            />
          </div>
          <div className="col-md-6">
            <AdminInput
              label="Messaging Service SID (optional)"
              value={twilio.messagingServiceSid}
              onChange={(v) => setCms(patchTwilio(cms, { messagingServiceSid: v }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
