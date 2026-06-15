'use client';

import { useMemo, useState } from 'react';
import type { CmsData, Lawyer, SubscriptionPlan } from '@/lib/cms/types';
import { formatPlanPrice } from '@/lib/subscription';
import {
  applyPlanEntitlementsToLawyer,
  featureLabel,
  normalizeFeatureIds,
  syncLawyersWithPlans,
} from '@/lib/subscription-features';
import { useCmsSave } from '@/components/admin/cms-editor';
import { AdminInput } from '@/components/admin/cms-editor';
import { PlanFeaturePicker } from '@/components/admin/plan-feature-picker';

export function SubscriptionsManager({ initial }: { initial: CmsData }) {
  const [cms, setCms] = useState(initial);
  const [bulkPlanId, setBulkPlanId] = useState('basic');
  const { save, saving, message } = useCmsSave();

  const plans = cms.subscriptionPlans ?? [];

  const syncedLawyers = useMemo(
    () => syncLawyersWithPlans(cms.lawyers, plans),
    [cms.lawyers, plans],
  );

  function updatePlan(id: string, patch: Partial<SubscriptionPlan>) {
    const nextPlans = plans.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setCms({
      ...cms,
      subscriptionPlans: nextPlans,
      lawyers: syncLawyersWithPlans(cms.lawyers, nextPlans),
    });
  }

  function assignPlanToAll(planId: string) {
    if (!confirm(`Assign "${planName(planId)}" to all ${cms.lawyers.length} lawyers?`)) return;
    const nextPlans = cms.subscriptionPlans ?? [];
    const lawyers: Lawyer[] = cms.lawyers.map((l) =>
      applyPlanEntitlementsToLawyer({ ...l, subscriptionPlanId: planId }, nextPlans),
    );
    setCms({ ...cms, lawyers });
  }

  function planName(id: string) {
    return plans.find((p) => p.id === id)?.name ?? id;
  }

  async function handleSave() {
    const next = {
      ...cms,
      lawyers: syncLawyersWithPlans(cms.lawyers, plans),
    };
    setCms(next);
    await save(next);
  }

  return (
    <div>
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 className="card-title mb-0">Subscription plans</h3>
            <p className="text-muted mb-0 fs-12">
              Select features per plan — lawyers inherit top rated badge, search priority & booking limits
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save plans & assignments'}
          </button>
        </div>
        {message && (
          <div className="card-body border-bottom py-2">
            <span className="fs-12 text-muted">{message}</span>
          </div>
        )}
        <div className="card-body">
          <div className="row g-4">
            {plans.map((plan) => (
              <div key={plan.id} className="col-lg-4">
                <div className={`card h-100 ${plan.highlight ? 'border-primary' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-light text-dark text-uppercase fs-10">{plan.id}</span>
                      <label className="form-check form-switch mb-0">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={plan.active}
                          onChange={(e) => updatePlan(plan.id, { active: e.target.checked })}
                        />
                        <span className="form-check-label fs-12">Active</span>
                      </label>
                    </div>
                    <AdminInput
                      label="Plan name"
                      value={plan.name}
                      onChange={(v) => updatePlan(plan.id, { name: v })}
                    />
                    <div className="row g-2 mt-1">
                      <div className="col-7">
                        <AdminInput
                          label="Monthly price"
                          value={String(plan.priceMonthly)}
                          onChange={(v) => updatePlan(plan.id, { priceMonthly: parseInt(v, 10) || 0 })}
                        />
                      </div>
                      <div className="col-5">
                        <AdminInput
                          label="Currency"
                          value={plan.currency}
                          onChange={(v) => updatePlan(plan.id, { currency: v })}
                        />
                      </div>
                    </div>
                    <p className="fw-semibold text-primary mb-2">{formatPlanPrice(plan)}</p>
                    <label className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={plan.highlight}
                        onChange={(e) => updatePlan(plan.id, { highlight: e.target.checked })}
                      />
                      <span className="form-check-label fs-12">Highlight as recommended</span>
                    </label>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control mb-3"
                      rows={2}
                      value={plan.description}
                      onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
                    />
                    <PlanFeaturePicker
                      selected={plan.features}
                      onChange={(features) => updatePlan(plan.id, { features })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title mb-0">Bulk assign plan</h3>
        </div>
        <div className="card-body d-flex flex-wrap gap-2 align-items-end">
          <div style={{ minWidth: 220 }}>
            <label className="form-label">Plan for all lawyers</label>
            <select
              className="form-select"
              value={bulkPlanId}
              onChange={(e) => setBulkPlanId(e.target.value)}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatPlanPrice(p)})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => assignPlanToAll(bulkPlanId)}
          >
            Apply to all {cms.lawyers.length} lawyers
          </button>
          <p className="text-muted fs-12 mb-0 w-100">
            Changing a lawyer&apos;s plan under Lawyers → Edit also reapplies entitlements on save.
          </p>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title mb-0">Lawyer plan summary</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Plan</th>
                  <th>Top rated</th>
                  <th>Entitlements</th>
                </tr>
              </thead>
              <tbody>
                {syncedLawyers.map((l) => {
                  const plan = plans.find((p) => p.id === (l.subscriptionPlanId ?? 'basic'));
                  const feats = normalizeFeatureIds(plan?.features).map(featureLabel);
                  return (
                    <tr key={l.id}>
                      <td className="fw-semibold">{l.name}</td>
                      <td>{planName(l.subscriptionPlanId ?? 'basic')}</td>
                      <td>{l.topRated ? 'Yes' : '—'}</td>
                      <td className="fs-11 text-muted">{feats.join(', ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
