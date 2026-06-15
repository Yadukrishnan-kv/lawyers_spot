/** Feature IDs for subscription plans (keep in sync with platform/src/lib/subscription-features.ts) */

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

const FEATURE_ID_SET = new Set<string>([
  'profile_listing',
  'bookings_monthly_5',
  'unlimited_bookings',
  'email_support',
  'phone_support',
  'standard_search',
  'priority_search',
  'top_rated_badge',
  'dedicated_manager',
  'analytics_dashboard',
]);

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
    const key = raw.trim().toLowerCase();
    if (FEATURE_ID_SET.has(raw)) {
      out.add(raw as SubscriptionFeatureId);
      continue;
    }
    const mapped = LEGACY_FEATURE_MAP[key];
    if (mapped) out.add(mapped);
  }
  if (out.has('unlimited_bookings')) out.delete('bookings_monthly_5');
  return [...out];
}

export function applyPlanFlagsToLawyer<T extends Record<string, unknown>>(
  lawyer: T,
  planFeatures: string[] | undefined,
): T {
  const ids = new Set(normalizeFeatureIds(planFeatures));
  return {
    ...lawyer,
    featured: false,
    topRated: ids.has('top_rated_badge'),
  };
}

export function monthlyBookingLimit(planFeatures: string[] | undefined): number | null {
  const ids = normalizeFeatureIds(planFeatures);
  if (ids.includes('unlimited_bookings')) return null;
  if (ids.includes('bookings_monthly_5')) return 5;
  return 0;
}
