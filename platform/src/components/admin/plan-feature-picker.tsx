'use client';

import type { SubscriptionFeatureId } from '@/lib/subscription-features';
import {
  SUBSCRIPTION_FEATURE_CATALOG,
  featureLabel,
  normalizeFeatureIds,
  togglePlanFeature,
} from '@/lib/subscription-features';

const GROUP_LABELS: Record<string, string> = {
  listing: 'Listing & search',
  visibility: 'Homepage & badges',
  bookings: 'Bookings',
  support: 'Support & tools',
};

type Props = {
  selected: string[];
  onChange: (features: SubscriptionFeatureId[]) => void;
};

export function PlanFeaturePicker({ selected, onChange }: Props) {
  const active = new Set(normalizeFeatureIds(selected));
  const groups = [...new Set(SUBSCRIPTION_FEATURE_CATALOG.map((f) => f.group))];

  return (
    <div className="border rounded p-2 bg-light-subtle">
      <label className="form-label mb-2">Plan features</label>
      <p className="text-muted fs-11 mb-2">
        Selected features are applied automatically to every lawyer on this plan.
      </p>
      {groups.map((group) => (
        <div key={group} className="mb-2">
          <div className="fw-semibold fs-11 text-uppercase text-muted mb-1">
            {GROUP_LABELS[group] ?? group}
          </div>
          <div className="d-flex flex-column gap-1">
            {SUBSCRIPTION_FEATURE_CATALOG.filter((f) => f.group === group).map((feature) => (
              <label key={feature.id} className="form-check mb-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={active.has(feature.id)}
                  onChange={(e) =>
                    onChange(togglePlanFeature(selected, feature.id, e.target.checked))
                  }
                />
                <span className="form-check-label fs-12">
                  {feature.label}
                  <span className="text-muted d-block fs-11">{feature.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {active.size > 0 && (
        <p className="text-muted fs-11 mb-0 mt-2">
          Active: {[...active].map(featureLabel).join(' · ')}
        </p>
      )}
    </div>
  );
}
