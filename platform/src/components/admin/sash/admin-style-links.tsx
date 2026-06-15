import { adminAsset } from '@/lib/admin-assets';

const ADMIN_STYLE_LINKS = [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
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
] as const;

/** Server-rendered admin theme CSS (duplicated in head by AdminStylesInjector for reliability). */
export function AdminStyleLinks() {
  return (
    <>
      {ADMIN_STYLE_LINKS.map((spec) => (
        <link
          key={spec.href}
          rel={spec.rel}
          href={spec.href}
          {...('type' in spec && spec.type ? { type: spec.type } : {})}
          {...('id' in spec && spec.id ? { id: spec.id } : {})}
          {...('crossOrigin' in spec && spec.crossOrigin ? { crossOrigin: spec.crossOrigin } : {})}
        />
      ))}
    </>
  );
}
