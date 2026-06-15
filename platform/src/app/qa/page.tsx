import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import { getQaPosts, getTrendingTopics } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Legal Q&A',
  description: 'Ask free legal questions and get answers from verified lawyers across India.',
};

export default async function QAPage() {
  const qaPosts = await getQaPosts();
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Legal Q&A' }]} />
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-navy-900 dark:text-white">Legal Q&A</h1>
          <p className="mt-2 text-slate-600">2.5M+ questions answered by verified lawyers</p>
        </div>
        <Button asChild><Link href="/qa/ask">Ask a Question</Link></Button>
      </div>
      <input
        placeholder="Search legal questions..."
        className="mt-8 h-12 w-full rounded-xl border border-slate-200 px-4 dark:border-navy-700 dark:bg-navy-800"
      />
      <div className="mt-6 flex flex-wrap gap-2">
        {trendingTopics.map((t) => (
          <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium dark:bg-navy-800">{t}</span>
        ))}
      </div>
      <div className="mt-10 space-y-4">
        {qaPosts.map((q) => (
          <Link
            key={q.id}
            href={`/qa/${q.slug}`}
            className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-soft dark:border-navy-700 dark:bg-navy-800"
          >
            <span className="text-xs font-bold text-royal-600">{q.category}</span>
            <h2 className="mt-2 text-xl font-bold text-navy-900 dark:text-white">{q.title}</h2>
            <p className="mt-2 text-slate-600">{q.excerpt}</p>
            <div className="mt-4 flex gap-4 text-sm text-slate-500">
              <span>{q.answers} lawyer answers</span>
              <span>{q.views.toLocaleString()} views</span>
              <span className="text-royal-600">↑ Helpful</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
