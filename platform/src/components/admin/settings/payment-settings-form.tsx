'use client';

import type { PaymentGatewaySettings } from '@/lib/cms/types';
import { AdminInput } from '@/components/admin/cms-editor';
import { useSettingsCms } from '@/components/admin/settings/settings-context';

function patchPayment(cms: ReturnType<typeof useSettingsCms>['cms'], patch: Partial<PaymentGatewaySettings>) {
  return {
    ...cms,
    siteContent: {
      ...cms.siteContent,
      integrations: {
        ...cms.siteContent.integrations,
        payment: { ...cms.siteContent.integrations.payment, ...patch },
      },
    },
  };
}

export function PaymentSettingsForm() {
  const { cms, setCms } = useSettingsCms();
  const payment = cms.siteContent.integrations.payment;

  return (
    <div className="card">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h3 className="card-title mb-0">Payment Gateway</h3>
          <p className="text-muted mb-0 fs-12">Lawyer subscriptions and client booking payments</p>
        </div>
        <label className="form-check form-switch mb-0">
          <input
            type="checkbox"
            className="form-check-input"
            checked={payment.enabled}
            onChange={(e) => setCms(patchPayment(cms, { enabled: e.target.checked }))}
          />
          <span className="form-check-label">Enabled</span>
        </label>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Provider</label>
            <select
              className="form-select"
              value={payment.provider}
              onChange={(e) =>
                setCms(
                  patchPayment(cms, {
                    provider: e.target.value as PaymentGatewaySettings['provider'],
                  }),
                )
              }
            >
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="payu">PayU</option>
            </select>
          </div>
          <div className="col-md-6">
            <AdminInput
              label="Currency"
              value={payment.currency}
              onChange={(v) => setCms(patchPayment(cms, { currency: v }))}
            />
          </div>
          <div className="col-12">
            <label className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={payment.testMode}
                onChange={(e) => setCms(patchPayment(cms, { testMode: e.target.checked }))}
              />
              <span className="form-check-label">Test / sandbox mode</span>
            </label>
          </div>
        </div>

        {(payment.provider === 'razorpay' || payment.provider === 'payu') && (
          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <AdminInput
                label="Razorpay Key ID"
                value={payment.razorpayKeyId}
                onChange={(v) => setCms(patchPayment(cms, { razorpayKeyId: v }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Razorpay Key Secret</label>
              <input
                type="password"
                className="form-control"
                value={payment.razorpayKeySecret}
                onChange={(e) => setCms(patchPayment(cms, { razorpayKeySecret: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        {payment.provider === 'stripe' && (
          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <AdminInput
                label="Stripe publishable key"
                value={payment.stripePublishableKey}
                onChange={(v) => setCms(patchPayment(cms, { stripePublishableKey: v }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Stripe secret key</label>
              <input
                type="password"
                className="form-control"
                value={payment.stripeSecretKey}
                onChange={(e) => setCms(patchPayment(cms, { stripeSecretKey: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
