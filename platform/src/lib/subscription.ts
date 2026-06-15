import type { SubscriptionPlan } from '@/lib/cms/types';

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

export function formatPlanPrice(plan: SubscriptionPlan): string {
  const sym = plan.currency === 'INR' ? '₹' : plan.currency;
  return `${sym}${plan.priceMonthly.toLocaleString('en-IN')}/mo`;
}

export function planNameById(plans: SubscriptionPlan[], id?: string): string {
  if (!id) return '—';
  return plans.find((p) => p.id === id)?.name ?? id;
}
