import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { InternalLinksBlock } from '@/components/seo/internal-links';
import { Button } from '@/components/ui/button';
import { getArticleBySlug, getArticles, getPracticeAreas } from '@/lib/data';
import { practiceAreaPath } from '@/lib/practice-utils';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article' };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const articles = await getArticles();
  const practiceAreas = await getPracticeAreas();

  const toc = ['Overview', 'Legal Framework', 'Step-by-Step Process', 'Documents Required', 'When to Hire a Lawyer', 'FAQ'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/articles' },
          { label: article.title },
        ]}
      />
      <div className="grid gap-12 lg:grid-cols-4">
        <article className="lg:col-span-3">
          <span className="text-xs font-bold text-royal-600">{article.category}</span>
          <h1 className="mt-2 font-display text-4xl font-bold text-navy-900 dark:text-white">{article.title}</h1>
          <p className="mt-4 text-slate-500">{article.date} · {article.readTime} · {article.author}</p>
          <div className="relative mt-8 h-72 overflow-hidden rounded-2xl">
            <Image src={article.image} alt="" fill className="object-cover" priority />
          </div>
          <div className="prose-legal mt-10">
            <p className="text-xl text-slate-600">{article.excerpt}</p>
            <h2 id="overview">Overview</h2>
            <p>Understanding your legal rights is the first step toward resolution. This guide is structured for readability, SEO performance, and long session engagement.</p>
            <h2 id="framework">Legal Framework</h2>
            <p>Indian law provides specific remedies and procedures. Consult a verified lawyer for case-specific advice.</p>
            <h2 id="faq">FAQ</h2>
            <p><strong>When should I consult a lawyer?</strong> Early consultation often improves outcomes significantly.</p>
          </div>
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-royal-600 to-navy-800 p-8 text-white">
            <h3 className="text-xl font-bold">Need expert legal advice?</h3>
            <Button variant="gold" className="mt-4" asChild><Link href="/lawyers">Find a Lawyer</Link></Button>
          </div>
        </article>
        <aside className="space-y-6">
          <nav className="sticky top-24 rounded-2xl border border-slate-200 p-5 dark:border-navy-700">
            <h3 className="font-bold">Table of Contents</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {toc.map((item) => (
                <li key={item}><a href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="text-royal-600 hover:underline">{item}</a></li>
              ))}
            </ul>
          </nav>
          <div className="rounded-2xl border p-5 dark:border-navy-700">
            <h3 className="font-bold">Practice Areas</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {practiceAreas.slice(0, 5).map((p) => (
                <li key={p.slug}><Link href={practiceAreaPath(p)} className="text-royal-600">{p.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Related</h3>
            {articles.filter((a) => a.slug !== slug).map((a) => (
              <Link key={a.slug} href={`/articles/${a.slug}`} className="mt-2 block text-sm text-royal-600">{a.title}</Link>
            ))}
          </div>
        </aside>
      </div>
      <div className="mt-16"><InternalLinksBlock /></div>
    </div>
  );
}
