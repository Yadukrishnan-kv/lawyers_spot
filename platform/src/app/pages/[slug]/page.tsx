import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { getSiteContent } from '@/lib/data';
import { resolveCustomCmsPageBySlug } from '@/lib/admin/cms-pages-registry';
import { sanitizeCmsHtml } from '@/lib/security/sanitize-html';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sc = await getSiteContent();
  const page = resolveCustomCmsPageBySlug(sc, slug);
  if (!page) return { title: 'Page not found' };
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription,
    alternates: { canonical: `/pages/${slug}` },
  };
}

export default async function CustomCmsPage({ params }: Props) {
  const { slug } = await params;
  const page = resolveCustomCmsPageBySlug(await getSiteContent(), slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: page.title }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">{page.title}</h1>
      {page.lastUpdated && (
        <p className="mt-2 text-sm text-slate-500">Last updated: {page.lastUpdated}</p>
      )}
      <div
        className="prose-legal mt-8 space-y-6 text-slate-600"
        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(page.body) }}
      />
    </div>
  );
}
