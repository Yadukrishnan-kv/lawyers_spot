import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import { getQaPosts } from '@/lib/data';
import { getQaAnswersBySlug } from '@/lib/qa-answers';

type Props = { params: Promise<{ slug: string }> };

function formatAnswerDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function QADetailPage({ params }: Props) {
  const { slug } = await params;
  const post = (await getQaPosts()).find((q) => q.slug === slug);
  if (!post) notFound();

  const { answers } = await getQaAnswersBySlug(slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Q&A', href: '/qa' }, { label: post.title }]} />
      <span className="text-xs font-bold text-royal-600">{post.category}</span>
      <h1 className="mt-2 font-display text-3xl font-bold">{post.title}</h1>
      <p className="mt-6 text-slate-600">{post.excerpt}</p>

      {answers.length > 0 ? (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-navy-900 dark:text-white">
            {answers.length} lawyer {answers.length === 1 ? 'answer' : 'answers'}
          </h2>
          {answers.map((answer) => (
            <div
              key={answer.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-navy-700 dark:bg-navy-900"
            >
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{answer.body}</p>
              <p className="mt-4 text-sm text-slate-500">
                — {answer.lawyerName}
                {answer.createdAt ? ` · ${formatAnswerDate(answer.createdAt)}` : ''}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-navy-700 dark:bg-navy-900">
          <p className="font-semibold text-navy-900 dark:text-white">Awaiting lawyer answers</p>
          <p className="mt-3 text-slate-600">
            Verified advocates on LawyerSpot can reply to this question. For case-specific advice, consult a lawyer directly.
          </p>
        </div>
      )}

      <Button className="mt-8" asChild>
        <Link href="/lawyers">Consult a Lawyer</Link>
      </Button>
    </div>
  );
}
