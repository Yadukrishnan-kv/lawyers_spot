'use client';

import { adminAsset } from '@/lib/admin-assets';

export function AdminHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="app-header header sticky">
      <div className="container-fluid main-container">
        <div className="d-flex">
          <a
            aria-label="Hide Sidebar"
            className="app-sidebar__toggle"
            data-bs-toggle="sidebar"
            href="#"
          />
          <a className="logo-horizontal" href="/admin">
            <img
              src={adminAsset('images/brand/logo-white.png')}
              className="header-brand-img desktop-logo"
              alt="LawyerSpot"
            />
            <img
              src={adminAsset('images/brand/logo-dark.png')}
              className="header-brand-img light-logo1"
              alt="LawyerSpot"
            />
          </a>
          <div className="main-header-center ms-3 d-none d-lg-block">
            <input type="text" className="form-control" placeholder="Search admin..." />
            <button type="button" className="btn px-0 pt-2">
              <i className="fe fe-search" aria-hidden="true" />
            </button>
          </div>
          <div className="d-flex order-lg-2 ms-auto header-right-icons align-items-center">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-view-site-btn"
              title="View public website"
            >
              <i className="fe fe-globe" aria-hidden="true" />
              <span className="admin-view-site-label">View Website</span>
            </a>
            <button
              className="navbar-toggler navresponsive-toggler d-lg-none ms-auto"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent-4"
              aria-controls="navbarSupportedContent-4"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon fe fe-more-vertical" />
            </button>
            <div className="navbar navbar-collapse responsive-navbar p-0">
              <div className="collapse navbar-collapse" id="navbarSupportedContent-4">
                <div className="d-flex order-lg-2">
                  <div className="dropdown d-flex profile-1">
                    <a
                      href="#"
                      data-bs-toggle="dropdown"
                      className="nav-link leading-none d-flex"
                      onClick={(e) => e.preventDefault()}
                    >
                      <span className="avatar profile-user brround cover-image bg-primary d-flex align-items-center justify-content-center text-white">
                        AD
                      </span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                      <div className="drop-heading">
                        <div className="text-center">
                          <h5 className="text-dark mb-0 fs-14 fw-semibold">Admin</h5>
                          <small className="text-muted">LawyerSpot</small>
                        </div>
                      </div>
                      <div className="dropdown-divider m-0" />
                      <a className="dropdown-item" href="/admin/settings/general">
                        <i className="dropdown-icon fe fe-settings" /> Settings
                      </a>
                      <button type="button" className="dropdown-item w-100 text-start border-0 bg-transparent" onClick={onLogout}>
                        <i className="dropdown-icon fe fe-power" /> Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
