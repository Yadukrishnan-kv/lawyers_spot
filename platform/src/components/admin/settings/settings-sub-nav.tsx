'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/admin/settings/general', label: 'General Settings', icon: 'fe-settings' },
  { href: '/admin/settings/email', label: 'Email SMTP', icon: 'fe-mail' },
  { href: '/admin/settings/payment', label: 'Payment Gateway', icon: 'fe-credit-card' },
  { href: '/admin/settings/twilio', label: 'Twilio SMS', icon: 'fe-smartphone' },
] as const;

export function SettingsSubNav() {
  const pathname = usePathname();

  return (
    <div className="card settings-sub-nav">
      <div className="card-header py-3">
        <h3 className="card-title mb-0 fs-14">Settings</h3>
      </div>
      <div className="list-group list-group-flush">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`list-group-item list-group-item-action d-flex align-items-center gap-2 border-0${active ? ' active' : ''}`}
            >
              <i className={`fe ${item.icon}`} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
