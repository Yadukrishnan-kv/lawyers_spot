'use client';

import { useEffect } from 'react';
import { AdminFooter } from '@/components/admin/sash/admin-footer';
import { AdminHeader } from '@/components/admin/sash/admin-header';
import { AdminScripts } from '@/components/admin/sash/admin-scripts';
import { AdminSidebar } from '@/components/admin/sash/admin-sidebar';
import { useAdminLayout } from '@/components/admin/admin-layout-context';
import { adminAsset } from '@/lib/admin-assets';

type ShellProps = {
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children: React.ReactNode;
};

function AdminPageHeader({ title, subtitle, breadcrumbs }: Omit<ShellProps, 'children'>) {
  if (!title && !subtitle && (!breadcrumbs || breadcrumbs.length === 0)) return null;

  return (
    <div className="page-header">
      <div>
        {title && <h1 className="page-title">{title}</h1>}
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div>
          <ol className="breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <li
                key={crumb.label}
                className={`breadcrumb-item${i === breadcrumbs.length - 1 ? ' active' : ''}`}
                aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {crumb.href ? <a href={crumb.href}>{crumb.label}</a> : crumb.label}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/** Page title + content. Shell chrome lives in admin layout when persistent layout is active. */
export function AdminShell({ title, subtitle, breadcrumbs, children }: ShellProps) {
  const inLayout = useAdminLayout();

  if (inLayout) {
    return (
      <>
        <AdminPageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />
        {children}
      </>
    );
  }

  return <AdminStandaloneShell title={title} subtitle={subtitle} breadcrumbs={breadcrumbs}>{children}</AdminStandaloneShell>;
}

/** Fallback full shell (login or legacy routes without admin layout wrapper). */
function AdminStandaloneShell({ title, subtitle, breadcrumbs, children }: ShellProps) {
  useEffect(() => {
    const prev = document.body.className;
    const fontVars = prev.match(/--font-\S+|\bfont-sans\b/g)?.join(' ') ?? '';
    document.body.className = ['app', 'sidebar-mini', 'ltr', 'light-mode', fontVars].filter(Boolean).join(' ');
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'none';
    return () => {
      document.body.className = prev;
    };
  }, []);

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'same-origin' });
    window.location.href = '/admin/login';
  }

  return (
    <>
      <div id="global-loader" className="admin-global-loader--hidden">
        <img src={adminAsset('images/loader.svg')} className="loader-img" alt="" />
      </div>
      <div className="page">
        <div className="page-main">
          <AdminHeader onLogout={logout} />
          <AdminSidebar />
          <div className="main-content app-content mt-0">
            <div className="side-app">
              <div className="main-container container-fluid">
                <AdminPageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />
                {children}
              </div>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
      <a href="#top" id="back-to-top">
        <i className="fa fa-angle-up" />
      </a>
      <AdminScripts />
    </>
  );
}
