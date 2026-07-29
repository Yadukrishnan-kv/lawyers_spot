import { LawyerQaCreateForm } from '@/components/lawyer/lawyer-qa-create-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Create Q&A' };

export default function LawyerQaCreatePage() {
  return <LawyerQaCreateForm />;
}
