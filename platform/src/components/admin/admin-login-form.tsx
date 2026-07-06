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
  const [showPassword, setShowPassword] = useState(false);

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
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          position: relative;
          overflow: hidden;
        }
        .login-page::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(98, 89, 202, 0.08) 0%, transparent 50%);
          animation: loginPulse 15s ease-in-out infinite;
        }
        @keyframes loginPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          animation: cardSlideUp 0.6s ease-out;
        }
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .login-logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #6259ca 0%, #8b7cf6 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(98, 89, 202, 0.35);
        }
        .login-logo-icon svg {
          width: 26px;
          height: 26px;
          color: white;
        }
        .login-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .login-subtitle {
          text-align: center;
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 2rem;
          margin-top: 0.5rem;
        }
        .login-input-group {
          position: relative;
          margin-bottom: 1.25rem;
        }
        .login-input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          transition: color 0.2s;
        }
        .login-input-group:focus-within .login-input-icon {
          color: #6259ca;
        }
        .login-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #1a1a2e;
          background: #f9fafb;
          transition: all 0.2s ease;
          outline: none;
          font-family: inherit;
        }
        .login-input::placeholder {
          color: #9ca3af;
        }
        .login-input:focus {
          border-color: #6259ca;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(98, 89, 202, 0.1);
        }
        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .password-toggle:hover {
          color: #6259ca;
        }
        .login-btn {
          width: 100%;
          padding: 0.9rem;
          background: linear-gradient(135deg, #6259ca 0%, #8b7cf6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
          position: relative;
          overflow: hidden;
          font-family: inherit;
        }
        .login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .login-btn:hover::before {
          left: 100%;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(98, 89, 202, 0.4);
        }
        .login-btn:active {
          transform: translateY(0);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .login-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .login-error svg {
          flex-shrink: 0;
        }
        .login-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f3f4f6;
        }
        .login-footer p {
          color: #9ca3af;
          font-size: 0.8rem;
          margin: 0;
        }
        .login-footer span {
          color: #6b7280;
          font-weight: 500;
        }
        .login-brand-bottom {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .login-brand-bottom svg {
          width: 18px;
          height: 18px;
          color: #d1d5db;
        }
        .login-brand-bottom span {
          color: #d1d5db;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="login-title">LawyerSpot</h1>
          </div>
          <p className="login-subtitle">Sign in to admin dashboard</p>

          {error && (
            <div className="login-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <span className="login-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13 2 4" />
                </svg>
              </span>
              <input
                className="login-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="login-input-group">
              <span className="login-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Demo credentials: <span>admin@lawyerspot.com</span> / <span>admin123</span>
            </p>
            <div className="login-brand-bottom">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>Secure Admin Access</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <AdminLoginScripts />
    </>
  );
}
