import type { MetadataRoute } from 'next';
import { getSiteConfig } from '@/lib/data';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { url } = await getSiteConfig();
  const base = url.replace(/\/$/, '');
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/dashboard/', '/lawyer-dashboard/', '/api/'] },
    sitemap: `${base}/sitemap.xml`,
  };
}
