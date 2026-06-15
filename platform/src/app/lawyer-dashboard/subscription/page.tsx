import { LawyerSubscriptionPanel } from '@/components/lawyer/lawyer-subscription-panel';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Subscription' };

export default function LawyerSubscriptionPage() {
  return <LawyerSubscriptionPanel />;
}
