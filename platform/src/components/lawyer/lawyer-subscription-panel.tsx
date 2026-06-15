'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { SubscriptionPlan } from '@/lib/data-types';
import { formatPlanPrice } from '@/lib/subscription';
import { featureLabel, normalizeFeatureIds } from '@/lib/subscription-features';
import { fetchLawyerSubscription, renewLawyerSubscription } from '@/lib/user-auth';

type SubscriptionData = {
  planId: string;
  plan: SubscriptionPlan | null;
  expiresAt: string | null;
  status: 'active' | 'expiring_soon' | 'expired';
  availablePlans: SubscriptionPlan[];
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function statusLabel(status: SubscriptionData['status']) {
  if (status === 'expired') return { text: 'Expired', className: 'text-red-600 bg-red-50' };
  if (status === 'expiring_soon') return { text: 'Expiring soon', className: 'text-amber-700 bg-amber-50' };
  return { text: 'Active', className: 'text-emerald-700 bg-emerald-50' };
}

export function LawyerSubscriptionPanel() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    try {
      const sub = await fetchLawyerSubscription();
      setData(sub);
      setSelectedPlanId(sub.planId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onRenew() {
    setRenewing(true);
    setError('');
    setMessage('');
    try {
      const result = await renewLawyerSubscription(selectedPlanId);
      setMessage(result.message ?? 'Subscription renewed for 30 days.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Renewal failed');
    } finally {
      setRenewing(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading subscription…</p>;
  if (error && !data) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return null;

  const badge = statusLabel(data.status);
  const features = normalizeFeatureIds(data.plan?.features);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-navy-900 dark:text-white">Current plan</h2>
              <p className="mt-1 text-2xl font-bold text-royal-600">
                {data.plan?.name ?? data.planId}
              </p>
              {data.plan && (
                <p className="mt-1 text-sm text-slate-500">
                  {formatPlanPrice(data.plan)} · {data.plan.description}
                </p>
              )}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>
              {badge.text}
            </span>
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-navy-800">
              <dt className="text-xs font-semibold uppercase text-slate-500">Valid until</dt>
              <dd className="mt-1 font-semibold text-navy-900 dark:text-white">
                {formatDate(data.expiresAt)}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-navy-800">
              <dt className="text-xs font-semibold uppercase text-slate-500">Plan features</dt>
              <dd className="mt-2 space-y-1 text-sm text-slate-600">
                {features.length > 0 ? (
                  features.map((f) => <div key={f}>• {featureLabel(f)}</div>)
                ) : (
                  <span>—</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold text-navy-900 dark:text-white">Renew subscription</h2>
          <p className="mt-1 text-sm text-slate-500">
            Extend your plan by 30 days. You can keep your current plan or switch to another tier.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {data.availablePlans.map((plan) => (
              <label
                key={plan.id}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  selectedPlanId === plan.id
                    ? 'border-royal-500 bg-royal-500/5'
                    : 'border-slate-200 dark:border-navy-700'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  className="sr-only"
                  checked={selectedPlanId === plan.id}
                  onChange={() => setSelectedPlanId(plan.id)}
                />
                <p className="font-bold text-navy-900 dark:text-white">{plan.name}</p>
                <p className="text-sm text-royal-600">{formatPlanPrice(plan)}</p>
                <p className="mt-2 text-xs text-slate-500">{plan.description}</p>
              </label>
            ))}
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
          <Button className="mt-4" onClick={onRenew} disabled={renewing}>
            {renewing ? 'Processing…' : 'Renew for 30 days'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
