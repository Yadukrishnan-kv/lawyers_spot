import { Suspense } from 'react';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export const metadata = { title: 'Admin Login | LawyerSpot' };

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="d-flex min-vh-100 align-items-center justify-content-center">
          <span className="text-muted">Loading...</span>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
