import { LawyerProfileForm } from '@/components/lawyer/lawyer-profile-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Profile' };

export default function LawyerProfilePage() {
  return <LawyerProfileForm />;
}
