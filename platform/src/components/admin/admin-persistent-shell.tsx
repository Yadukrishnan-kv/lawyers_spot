'use client';

import { useEffect } from 'react';
import { AdminFooter } from '@/components/admin/sash/admin-footer';
import { AdminHeader } from '@/components/admin/sash/admin-header';
import { AdminScripts } from '@/components/admin/sash/admin-scripts';
import { AdminSidebar } from '@/components/admin/sash/admin-sidebar';

export function AdminPersistentShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    for (const c of ['app', 'sidebar-mini', 'ltr', 'light-mode', 'admin-theme-active'] as const) {
      document.body.classList.add(c);
    }
    document.body.classList.remove('font-sans');

    const backToTop = document.getElementById('back-to-top');
    const onScroll = () => {
      if (!backToTop) return;
      backToTop.style.display = window.scrollY > 80 ? 'block' : 'none';
    };
    const onBackToTopClick = (e: Event) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    backToTop?.addEventListener('click', onBackToTopClick);
    onScroll();

    const onSidebarToggle = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement).closest('[data-bs-toggle="sidebar"]');
      if (!trigger) return;
      e.preventDefault();
      document.body.classList.toggle('sidenav-toggled');
    };

    const onOverlayClick = () => {
      document.body.classList.remove('sidebar-show');
    };

    const onResponsive = () => {
      if (window.innerWidth <= 1024) {
        document.body.classList.add('sidebar-gone');
      } else {
        document.body.classList.remove('sidebar-gone', 'sidebar-show');
      }
    };

    const onHeaderScroll = () => {
      const header = document.querySelector('.app-header');
      if (!header) return;
      if (window.scrollY >= 70) {
        header.classList.add('fixed-header', 'visible-title');
      } else {
        header.classList.remove('fixed-header', 'visible-title');
      }
    };

    const overlayEl = document.querySelector('.app-sidebar__overlay');

    document.addEventListener('click', onSidebarToggle);
    overlayEl?.addEventListener('click', onOverlayClick);
    window.addEventListener('resize', onResponsive);
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onResponsive();
    onHeaderScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      backToTop?.removeEventListener('click', onBackToTopClick);
      document.removeEventListener('click', onSidebarToggle);
      overlayEl?.removeEventListener('click', onOverlayClick);
      window.removeEventListener('resize', onResponsive);
      window.removeEventListener('scroll', onHeaderScroll);
    };
  }, []);

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'same-origin' });
    window.location.href = '/admin/login';
  }

  return (
    <>
      <div className="page">
        <div className="page-main">
          <AdminHeader onLogout={logout} />
          <AdminSidebar />
          <div className="main-content app-content mt-0">
            <div className="side-app">
              <div className="main-container container-fluid admin-main-container">{children}</div>
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
