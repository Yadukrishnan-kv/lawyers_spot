import type { Lawyer, SubscriptionPlan } from '@/lib/data-types';

/** Keep in sync with backend-node/src/subscription-features.ts */
export type SubscriptionFeatureId =
  | 'profile_listing'
  | 'bookings_monthly_5'
  | 'unlimited_bookings'
  | 'email_support'
  | 'phone_support'
  | 'standard_search'
  | 'priority_search'
  | 'top_rated_badge'
  | 'dedicated_manager'
  | 'analytics_dashboard';

export type SubscriptionFeatureDef = {
  id: SubscriptionFeatureId;
  label: string;
  description: string;
  group: 'listing' | 'bookings' | 'support' | 'visibility';
};

export const SUBSCRIPTION_FEATURE_CATALOG: SubscriptionFeatureDef[] = [
  {
    id: 'profile_listing',
    label: 'Profile listing',
    description: 'Public advocate profile on LawyerSpot',
    group: 'listing',
  },
  {
    id: 'standard_search',
    label: 'Standard search placement',
    description: 'Listed in default search order',
    group: 'listing',
  },
  {
    id: 'priority_search',
    label: 'Priority search placement',
    description: 'Ranked above Starter plans in search results',
    group: 'listing',
  },
  {
    id: 'top_rated_badge',
    label: 'Top Rated Lawyer badge',
    description: 'Automatically enables Top Rated badge and homepage section',
    group: 'visibility',
  },
  {
    id: 'bookings_monthly_5',
    label: 'Up to 5 bookings / month',
    description: 'Monthly booking cap for client consultations',
    group: 'bookings',
  },
  {
    id: 'unlimited_bookings',
    label: 'Unlimited bookings',
    description: 'No monthly cap on client bookings',
    group: 'bookings',
  },
  {
    id: 'email_support',
    label: 'Email support',
    description: 'Support via email',
    group: 'support',
  },
  {
    id: 'phone_support',
    label: 'Phone support',
    description: 'Priority phone support',
    group: 'support',
  },
  {
    id: 'dedicated_manager',
    label: 'Dedicated account manager',
    description: 'Named account manager for the practice',
    group: 'support',
  },
  {
    id: 'analytics_dashboard',
    label: 'Analytics dashboard',
    description: 'Profile views and lead analytics',
    group: 'support',
  },
];

const FEATURE_ID_SET = new Set<string>(SUBSCRIPTION_FEATURE_CATALOG.map((f) => f.id));

const LEGACY_FEATURE_MAP: Record<string, SubscriptionFeatureId> = {
  'profile listing': 'profile_listing',
  'up to 5 bookings/month': 'bookings_monthly_5',
  'email support': 'email_support',
  'standard search placement': 'standard_search',
  'everything in starter': 'profile_listing',
  'priority search placement': 'priority_search',
  'unlimited bookings': 'unlimited_bookings',
  'phone support': 'phone_support',
  'everything in professional': 'priority_search',
  'top rated badge eligible': 'top_rated_badge',
  'dedicated account manager': 'dedicated_manager',
  'analytics dashboard': 'analytics_dashboard',
};

export function normalizeFeatureIds(features: string[] | undefined): SubscriptionFeatureId[] {
  const out = new Set<SubscriptionFeatureId>();
  for (const raw of features ?? []) {
    const trimmed = raw.trim();
    if (FEATURE_ID_SET.has(trimmed)) {
      out.add(trimmed as SubscriptionFeatureId);
      continue;
    }
    const mapped = LEGACY_FEATURE_MAP[trimmed.toLowerCase()];
    if (mapped) out.add(mapped);
  }
  if (out.has('unlimited_bookings')) out.delete('bookings_monthly_5');
  return [...out];
}

export function featureLabel(id: SubscriptionFeatureId): string {
  return SUBSCRIPTION_FEATURE_CATALOG.find((f) => f.id === id)?.label ?? id;
}

export function planHasFeature(plan: SubscriptionPlan | undefined, featureId: SubscriptionFeatureId): boolean {
  if (!plan) return false;
  return normalizeFeatureIds(plan.features).includes(featureId);
}

export function getPlanForLawyer(
  plans: SubscriptionPlan[],
  lawyer: Pick<Lawyer, 'subscriptionPlanId'>,
): SubscriptionPlan | undefined {
  const id = lawyer.subscriptionPlanId ?? 'basic';
  return plans.find((p) => p.id === id) ?? plans.find((p) => p.id === 'basic');
}

/** Apply plan-driven flags (top rated) to a lawyer record */
export function applyPlanEntitlementsToLawyer<T extends Lawyer>(lawyer: T, plans: SubscriptionPlan[]): T {
  const plan = getPlanForLawyer(plans, lawyer);
  const ids = new Set(normalizeFeatureIds(plan?.features));
  return {
    ...lawyer,
    featured: false,
    topRated: ids.has('top_rated_badge'),
  };
}

export function syncLawyersWithPlans(lawyers: Lawyer[], plans: SubscriptionPlan[]): Lawyer[] {
  return lawyers.map((l) => applyPlanEntitlementsToLawyer(l, plans));
}

export function togglePlanFeature(
  current: string[],
  featureId: SubscriptionFeatureId,
  enabled: boolean,
): SubscriptionFeatureId[] {
  let next = new Set(normalizeFeatureIds(current));
  if (enabled) {
    next.add(featureId);
    if (featureId === 'unlimited_bookings') next.delete('bookings_monthly_5');
    if (featureId === 'bookings_monthly_5') next.delete('unlimited_bookings');
    if (featureId === 'priority_search') next.add('standard_search');
  } else {
    next.delete(featureId);
  }
  return [...next];
}

export function monthlyBookingLimitForLawyer(
  lawyer: Pick<Lawyer, 'subscriptionPlanId'>,
  plans: SubscriptionPlan[],
): number | null {
  const plan = getPlanForLawyer(plans, lawyer);
  const ids = normalizeFeatureIds(plan?.features);
  if (ids.includes('unlimited_bookings')) return null;
  if (ids.includes('bookings_monthly_5')) return 5;
  return 0;
}

export function lawyerHasPrioritySearch(lawyer: Lawyer, plans: SubscriptionPlan[]): boolean {
  return planHasFeature(getPlanForLawyer(plans, lawyer), 'priority_search');
}
