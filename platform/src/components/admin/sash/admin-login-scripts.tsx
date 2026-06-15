'use client';

import Script from 'next/script';
import { adminAsset } from '@/lib/admin-assets';

export function AdminLoginScripts() {
  return (
    <>
      <Script src={adminAsset('js/jquery.min.js')} strategy="afterInteractive" />
      <Script src={adminAsset('plugins/bootstrap/js/popper.min.js')} strategy="afterInteractive" />
      <Script src={adminAsset('plugins/bootstrap/js/bootstrap.min.js')} strategy="afterInteractive" />
      <Script src={adminAsset('js/show-password.min.js')} strategy="lazyOnload" />
      <Script src={adminAsset('plugins/p-scroll/perfect-scrollbar.js')} strategy="lazyOnload" />
      <Script src={adminAsset('js/themeColors.js')} strategy="lazyOnload" />
      <Script src={adminAsset('js/custom.js')} strategy="lazyOnload" />
      <Script src={adminAsset('js/custom-swicher.js')} strategy="lazyOnload" />
      <Script src={adminAsset('switcher/js/switcher.js')} strategy="lazyOnload" />
    </>
  );
}
