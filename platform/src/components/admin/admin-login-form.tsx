'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminLoginScripts } from '@/components/admin/sash/admin-login-scripts';
import { adminAsset } from '@/lib/admin-assets';

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('admin@lawyerspot.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prev = document.body.className;
    document.body.className = 'app sidebar-mini ltr login-img admin-theme-active';
    return () => {
      document.body.className = prev;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Login failed');
        return;
      }

      const from = searchParams.get('from') || '/admin';
      const target =
        from.startsWith('/admin') && from !== '/admin/login' ? from : '/admin';
      window.location.href = target;
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page">
        <div className="col col-login mx-auto mt-7">
          <div className="text-center">
            <a href="/admin">
              <img
                src={adminAsset('images/brand/logo-white.png')}
                className="header-brand-img"
                alt="LawyerSpot"
              />
            </a>
          </div>
        </div>
        <div className="container-login100">
          <div className="wrap-login100 p-6">
            <form className="login100-form validate-form" onSubmit={handleSubmit}>
              <span className="login100-form-title pb-5">LawyerSpot Admin</span>
              <p className="text-center text-muted mb-4">Sign in to manage your legal marketplace</p>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="wrap-input100 validate-input input-group mb-3">
                <span className="input-group-text bg-white text-muted">
                  <i className="zmdi zmdi-email text-muted" aria-hidden="true" />
                </span>
                <input
                  className="input100 border-start-0 form-control ms-0"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="wrap-input100 validate-input input-group mb-4" id="Password-toggle">
                <span className="input-group-text bg-white text-muted">
                  <i className="zmdi zmdi-lock text-muted" aria-hidden="true" />
                </span>
                <input
                  className="input100 border-start-0 form-control ms-0"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="container-login100-form-btn">
                <button type="submit" className="login100-form-btn btn-primary" disabled={loading}>
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </div>

              <p className="text-center text-muted mt-4 mb-0 fs-12">
                Default: admin@lawyerspot.com / admin123
              </p>
            </form>
          </div>
        </div>
      </div>
      <AdminLoginScripts />
    </>
  );
}
