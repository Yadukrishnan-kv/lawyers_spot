import type { MetadataRoute } from 'next';
import { getCmsData } from '@/lib/cms/store';
import { getLawyerSlug } from '@/lib/lawyer-slug';
import { practiceSeoSlug } from '@/lib/practice-utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cms = await getCmsData();
  const base = cms.siteConfig.url.replace(/\/$/, '');
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/lawyers',
    '/qa',
    '/guides',
    '/ipc',
    '/bns',
    '/acts',
    '/courts',
    '/cities',
    '/about',
    '/search',
    '/lawyer-signup',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  const dynamic = [
    ...cms.lawyers.map((l) => ({ url: `${base}/lawyers/${getLawyerSlug(l)}`, priority: 0.7 })),
    ...cms.cities.map((c) => ({ url: `${base}/city/${c.slug}`, priority: 0.75 })),
    ...cms.practiceAreas.map((p) => ({ url: `${base}/practice/${practiceSeoSlug(p)}`, priority: 0.7 })),
    ...cms.articles
      .filter((a) => a.status !== 'draft')
      .map((a) => ({ url: `${base}/articles/${a.slug}`, priority: 0.6 })),
    ...cms.qaPosts
      .filter((q) => q.status !== 'draft')
      .map((q) => ({ url: `${base}/qa/${q.slug}`, priority: 0.6 })),
    ...cms.siteContent.courts.map((c) => ({ url: `${base}/court/${c.slug}`, priority: 0.65 })),
    ...cms.siteContent.acts.map((a) => ({ url: `${base}/acts/${a.slug}`, priority: 0.65 })),
    ...cms.cities.flatMap((city) =>
      cms.practiceAreas.slice(0, 5).map((p) => ({
        url: `${base}/city/${city.slug}/${p.slug}`,
        priority: 0.55,
      })),
    ),
  ].map((entry) => ({
    ...entry,
    lastModified: now,
    changeFrequency: 'weekly' as const,
  }));

  return [...staticRoutes, ...dynamic];
}
