export type AdminNavChild = {
  href: string;
  label: string;
};

export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  external?: boolean;
  children?: AdminNavChild[];
};

export const adminNav: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: 'fe-home', exact: true },
  { href: '/admin/lawyers', label: 'Lawyers', icon: 'fe-briefcase' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: 'fe-credit-card' },
  { href: '/admin/articles', label: 'Articles', icon: 'fe-file-text' },
  { href: '/admin/qa', label: 'Q&A', icon: 'fe-message-square' },
  { href: '/admin/practice-areas', label: 'Practice Areas', icon: 'fe-grid' },
  { href: '/admin/states', label: 'State Master', icon: 'fe-flag' },
  { href: '/admin/cities', label: 'Cities', icon: 'fe-map-pin' },
  { href: '/admin/bookings', label: 'Bookings', icon: 'fe-calendar' },
  { href: '/admin/users', label: 'Admin Users', icon: 'fe-users' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'fe-bar-chart-2' },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: 'fe-settings',
    children: [
      { href: '/admin/settings/general', label: 'General Settings' },
      { href: '/admin/settings/email', label: 'Email SMTP' },
      { href: '/admin/settings/payment', label: 'Payment Gateway' },
      { href: '/admin/settings/twilio', label: 'Twilio SMS' },
    ],
  },
  { href: '/admin/cms-pages', label: 'CMS Pages', icon: 'fe-book-open' },
  { href: '/admin/footer', label: 'Footer & Courts', icon: 'fe-layers' },
  { href: '/admin/site-content', label: 'Site Content', icon: 'fe-layout' },
];
