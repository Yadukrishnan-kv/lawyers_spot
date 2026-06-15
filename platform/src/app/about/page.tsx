import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import { getSiteContent, getStats } from '@/lib/data';
import { resolveAboutPage } from '@/lib/site-page-content';
import { sanitizeCmsHtml } from '@/lib/security/sanitize-html';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const sc = await getSiteContent();
  const about = resolveAboutPage(sc);
  return {
    title: about.metaTitle,
    description: about.metaDescription,
  };
}

export default async function AboutPage() {
  const sc = await getSiteContent();
  const about = resolveAboutPage(sc);
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">{about.title}</h1>
      <div
        className="prose-legal mt-6 text-lg text-slate-600"
        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(about.body) }}
      />
      <ul className="mt-8 space-y-3 text-slate-600">
        {stats.map((s) => (
          <li key={s.label}>
            ✓ {s.value} {s.label}
          </li>
        ))}
      </ul>
      <div className="mt-10 flex gap-4">
        <Button asChild>
          <Link href="/lawyers">Find A Lawyer</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/qa/ask">Ask A Free Question</Link>
        </Button>
      </div>
    </div>
  );
}
