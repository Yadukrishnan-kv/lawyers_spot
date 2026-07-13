import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { getArticles } from '@/lib/data';
import { sanitizeCmsHtml } from '@/lib/security/sanitize-html';
import type { Metadata } from 'next';

const DEFAULT_ARTICLE_IMAGE = '/images/photo-1450101499163-c8848c66ca85.avif';

export const metadata: Metadata = {
  title: 'Legal Guides & Articles',
  description: 'Expert legal guides on divorce, property, tax, criminal law and more.',
};

export default async function ArticlesPage() {
  const articles = await getArticles();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Legal Guides' }]} />
      <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">Legal Knowledge Center</h1>
      <p className="mt-2 text-slate-600">SEO-optimized long-form content for authority & organic growth</p>
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link key={a.slug} href={`/articles/${a.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-navy-700 dark:bg-navy-800">
            <div className="relative h-52">
              <Image src={a.image || DEFAULT_ARTICLE_IMAGE} alt="" fill className="object-cover" sizes="33vw" />
            </div>
            <div className="p-5">
              <span className="text-xs font-bold text-royal-600">{a.category}</span>
              <h2 className="mt-2 font-bold group-hover:text-royal-600">{a.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500" dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(a.excerpt) }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
