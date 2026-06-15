import Link from 'next/link';
import { AdminShell } from '@/components/admin/admin-shell';
import { LawyerEditPage } from '@/components/admin/lawyer-edit-page';
import { getAdminCmsData } from '@/lib/cms/store';

export default async function NewLawyerPage() {
  const cms = await getAdminCmsData();
  const lawyer = {
    id: `lawyer-${Date.now()}`,
    slug: 'adv-new-advocate',
    name: 'New Advocate',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    rating: 4.5,
    reviews: 0,
    experience: 1,
    fee: 2000,
    currency: 'INR',
    location: 'Delhi',
    practice: 'criminal',
    specialization: ['General Practice'],
    online: true,
    verified: false,
    emailVerified: false,
    phoneVerified: false,
    education: [],
    courts: [],
    timeline: [],
    clientReviews: [],
    profileFaq: [],
    subscriptionPlanId: 'basic',
    topRated: false,
  };

  return (
    <AdminShell
      title="Add lawyer"
      subtitle="Create a new advocate profile"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Lawyers', href: '/admin/lawyers' },
        { label: 'New' },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/lawyers" className="text-decoration-none fs-12">
          ← Back to lawyers
        </Link>
      </p>
      <LawyerEditPage initial={cms} lawyer={lawyer} isNew />
    </AdminShell>
  );
}
