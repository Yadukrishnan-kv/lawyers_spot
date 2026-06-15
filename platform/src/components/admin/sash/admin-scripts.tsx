'use client';

import Script from 'next/script';
import { adminAsset } from '@/lib/admin-assets';

/** Bootstrap only — sidemenu.js requires PerfectScrollbar and breaks Next.js admin routes. */
export function AdminScripts() {
  return (
    <Script
      src={adminAsset('plugins/bootstrap/js/bootstrap.bundle.min.js')}
      strategy="afterInteractive"
    />
  );
}
