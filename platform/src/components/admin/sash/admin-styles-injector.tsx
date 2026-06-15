'use client';

import { useEffect } from 'react';
import { adminAsset } from '@/lib/admin-assets';

const ADMIN_STYLE_LINKS: { rel: string; href: string; type?: string; id?: string; crossOrigin?: string }[] = [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap',
  },
  { rel: 'shortcut icon', type: 'image/x-icon', href: adminAsset('images/brand/favicon.ico') },
  { id: 'style', rel: 'stylesheet', href: adminAsset('plugins/bootstrap/css/bootstrap.min.css') },
  { rel: 'stylesheet', href: adminAsset('css/style.css') },
  { rel: 'stylesheet', href: adminAsset('css/plugins.css') },
  { rel: 'stylesheet', href: adminAsset('css/icons.css') },
  { rel: 'stylesheet', href: adminAsset('switcher/css/switcher.css') },
  { rel: 'stylesheet', href: adminAsset('switcher/demo.css') },
];

/** Ensures admin theme CSS is in document.head (nested layout link tags are unreliable). */
export function AdminStylesInjector() {
  useEffect(() => {
    const created: HTMLLinkElement[] = [];

    for (const spec of ADMIN_STYLE_LINKS) {
      const exists = document.querySelector(`link[href="${spec.href}"]`);
      if (exists) continue;

      const link = document.createElement('link');
      link.rel = spec.rel;
      link.href = spec.href;
      if (spec.type) link.type = spec.type;
      if (spec.id) link.id = spec.id;
      if (spec.crossOrigin) link.crossOrigin = spec.crossOrigin;
      document.head.appendChild(link);
      created.push(link);
    }

    return () => {
      created.forEach((link) => link.remove());
    };
  }, []);

  return null;
}
