import Link from 'next/link';
import { AdminShell } from '@/components/admin/admin-shell';
import { SectionsForm } from '@/components/admin/sections-form';

export const metadata = { title: 'Create BNS Section | Admin' };

export default function CreateBnsSectionPage() {
  return (
    <AdminShell
      title="Create BNS Section"
      subtitle="Add a new BNS section"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Section', href: '/admin/sections/bns' },
        { label: 'BNS Section', href: '/admin/sections/bns' },
        { label: 'Create' },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/sections/bns" className="text-decoration-none fs-12">
          ← Back to BNS Sections
        </Link>
      </p>
      <SectionsForm type="bns" />
    </AdminShell>
  );
}
