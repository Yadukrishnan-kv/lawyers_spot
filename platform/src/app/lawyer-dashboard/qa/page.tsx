import { LawyerQaManager } from '@/components/lawyer/lawyer-qa-manager';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Q&A' };

export default function LawyerQaPage() {
  return <LawyerQaManager />;
}
