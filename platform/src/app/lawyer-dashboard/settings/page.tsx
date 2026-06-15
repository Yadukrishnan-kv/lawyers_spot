import { LawyerSettingsForm } from '@/components/lawyer/lawyer-settings-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Account Settings' };

export default function LawyerSettingsPage() {
  return <LawyerSettingsForm />;
}
