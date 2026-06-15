import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { getSiteContent } from '@/lib/data';
import { resolveTermsPage } from '@/lib/site-page-content';
import { sanitizeCmsHtml } from '@/lib/security/sanitize-html';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const sc = await getSiteContent();
  const page = resolveTermsPage(sc);
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: '/terms' },
  };
}

export default async function TermsPage() {
  const page = resolveTermsPage(await getSiteContent());

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
