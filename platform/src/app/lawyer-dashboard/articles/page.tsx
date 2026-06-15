import { LawyerArticlesManager } from '@/components/lawyer/lawyer-articles-manager';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Articles' };

export default function LawyerArticlesPage() {
  return <LawyerArticlesManager />;
}
