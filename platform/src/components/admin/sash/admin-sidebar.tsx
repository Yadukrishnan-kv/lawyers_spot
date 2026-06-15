'use client';

import { usePathname } from 'next/navigation';
import { adminNav } from '@/components/admin/admin-nav';
import { adminAsset } from '@/lib/admin-assets';

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="sticky admin-sidebar-wrap">
      <div className="app-sidebar__overlay" data-bs-toggle="sidebar" />
      <div className="app-sidebar admin-sidebar-panel">
        <div className="side-header">
          <a className="header-brand1" href="/admin">
            <img
              src={adminAsset('images/brand/logo-white.png')}
              className="header-brand-img desktop-logo"
              alt="LawyerSpot"
            />
            <img
              src={adminAsset('images/brand/icon-white.png')}
              className="header-brand-img toggle-logo"
              alt="LawyerSpot"
            />
            <img
              src={adminAsset('images/brand/icon-dark.png')}
              className="header-brand-img light-logo"
              alt="LawyerSpot"
            />
            <img
              src={adminAsset('images/brand/logo-dark.png')}
              className="header-brand-img light-logo1"
              alt="LawyerSpot"
            />
          </a>
        </div>
        <div className="main-sidemenu">
          <ul className="side-menu">
            <li className="sub-category">
              <h3>LawyerSpot</h3>
            </li>
            {adminNav.map((item) => {
              if (item.external) {
                const className = 'side-menu__item has-link';
                return (
                  <li key={item.href} className="slide">
                    <a className={className} href={item.href} target="_blank" rel="noopener noreferrer">
                      <i className={`side-menu__icon fe ${item.icon}`} />
                      <span className="side-menu__label">{item.label}</span>
                    </a>
                  </li>
                );
              }

              if (item.children?.length) {
                const sectionActive =
                  isActive(pathname, item.href) ||
                  item.children.some((c) => isActive(pathname, c.href, true));
                const firstChild = item.children[0].href;

                return (
                  <li key={item.href} className={`slide has-sub${sectionActive ? ' is-expanded' : ''}`}>
                    <a
                      className={`side-menu__item has-link${sectionActive ? ' active' : ''}`}
                      href={firstChild}
                    >
                      <i className={`side-menu__icon fe ${item.icon}`} />
                      <span className="side-menu__label">{item.label}</span>
                      <i className="angle fe fe-chevron-right" aria-hidden="true" />
                    </a>
                    <ul className="slide-menu" style={sectionActive ? { display: 'block' } : undefined}>
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <a
                              className={`slide-item${childActive ? ' active' : ''}`}
                              href={child.href}
                            >
                              {child.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              }

              const active = isActive(pathname, item.href, item.exact);
              const className = `side-menu__item has-link${active ? ' active' : ''}`;

              return (
                <li key={item.href} className={`slide${active ? ' is-expanded' : ''}`}>
                  <a className={className} href={item.href}>
                    <i className={`side-menu__icon fe ${item.icon}`} />
                    <span className="side-menu__label">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          {onLogout && (
            <div className="sidebar-logout">
              <button
                type="button"
                className="side-menu__item has-link w-100 border-0 bg-transparent d-flex align-items-center"
                onClick={onLogout}
              >
                <i className="side-menu__icon fe fe-power" />
                <span className="side-menu__label">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
