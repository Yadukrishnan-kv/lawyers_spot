import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { getSiteContent } from '@/lib/data';
import { resolveIpcPage } from '@/lib/site-page-content';
import { sanitizeCmsHtml } from '@/lib/security/sanitize-html';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const sc = await getSiteContent();
  const page = resolveIpcPage(sc);
  return { title: page.metaTitle, description: page.metaDescription };
}

export default async function IpcPage() {
  const sc = await getSiteContent();
  const page = resolveIpcPage(sc);
  const { ipcSections } = sc;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: page.title }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">{page.title}</h1>
      <p className="mt-2 text-slate-600">{page.subtitle}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ipcSections.map((s) => (
          <Link
            key={s.slug}
            href={`/acts/${s.slug}`}
            className="rounded-2xl border border-slate-200 p-5 hover:border-royal-500 dark:border-navy-700"
          >
            <span className="text-xs font-bold text-royal-600">IPC {s.code}</span>
            <h2 className="mt-1 font-bold">{s.title}</h2>
          </Link>
        ))}
      </div>
      {page.footerNote && (
        <div
          className="prose-legal mt-8 text-sm text-slate-500"
          dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(page.footerNote) }}
        />
      )}
    </div>
  );
}
