import { normalizeFeatureIds } from './subscription-features.js';

export type SubscriptionPlan = {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  description: string;
  features: string[];
  highlight: boolean;
  sortOrder: number;
  active: boolean;
};

export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Starter',
    priceMonthly: 999,
    currency: 'INR',
    description: 'Essential listing for new advocates building their practice.',
    features: ['profile_listing', 'bookings_monthly_5', 'email_support', 'standard_search'],
    highlight: false,
    sortOrder: 1,
    active: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 2499,
    currency: 'INR',
    description: 'Grow visibility with priority placement and more client leads.',
    features: [
      'profile_listing',
      'unlimited_bookings',
      'email_support',
      'phone_support',
      'standard_search',
      'priority_search',
    ],
    highlight: true,
    sortOrder: 2,
    active: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 4999,
    currency: 'INR',
    description: 'Maximum exposure for established practices and firms.',
    features: [
      'profile_listing',
      'unlimited_bookings',
      'email_support',
      'phone_support',
      'standard_search',
      'priority_search',
      'top_rated_badge',
      'dedicated_manager',
      'analytics_dashboard',
    ],
    highlight: false,
    sortOrder: 3,
    active: true,
  },
];

export function planRowToJson(row: Record<string, unknown>): SubscriptionPlan {
  const features = row.features;
  return {
    id: row.id as string,
    name: row.name as string,
    priceMonthly: row.price_monthly as number,
    currency: (row.currency as string) ?? 'INR',
    description: (row.description as string) ?? '',
    features: normalizeFeatureIds(Array.isArray(features) ? (features as string[]) : []),
    highlight: Boolean(row.highlight),
    sortOrder: (row.sort_order as number) ?? 0,
    active: row.active !== false,
  };
}
