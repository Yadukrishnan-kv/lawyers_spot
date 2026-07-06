import { Suspense } from 'react';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export const metadata = { title: 'Admin Login | LawyerSpot' };

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>Loading...</span>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
