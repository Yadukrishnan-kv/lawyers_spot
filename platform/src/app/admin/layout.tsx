import { IBM_Plex_Sans } from 'next/font/google';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';
import { AdminStyleLinks } from '@/components/admin/sash/admin-style-links';
import { AdminStylesInjector } from '@/components/admin/sash/admin-styles-injector';
import './admin-overrides.css';

const adminFont = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-admin-sans',
  display: 'swap',
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={adminFont.variable}>
      <AdminStyleLinks />
      <AdminStylesInjector />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var b=document.body;if(!b)return;var c=b.className||'';if(c.indexOf('app')===-1){b.className=(c?c+' ':'')+'app sidebar-mini ltr light-mode admin-theme-active';}})();`,
        }}
      />
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </div>
  );
}
