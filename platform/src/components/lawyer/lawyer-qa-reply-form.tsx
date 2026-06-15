'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchLawyerQaQuestion, submitLawyerQaAnswer } from '@/lib/user-auth';

type Props = { questionId: string };

export function LawyerQaReplyForm({ questionId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLawyerQaQuestion(questionId)
      .then((data) => {
        setTitle(data.question.title);
        setExcerpt(data.question.excerpt);
        setCategory(data.question.category);
        setQuestionContent(data.question.content ?? '');
        setBody(data.myAnswer?.body ?? '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [questionId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await submitLawyerQaAnswer(questionId, body);
      router.push('/lawyer-dashboard/qa');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save answer');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading question…</p>;
  if (error && !title) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <p className="text-xs font-bold uppercase text-royal-600">{category}</p>
          <h2 className="mt-1 text-xl font-bold text-navy-900 dark:text-white">{title}</h2>
          <p className="mt-3 text-slate-600">{excerpt}</p>
          {questionContent && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-navy-800">
              {questionContent}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-bold text-navy-900 dark:text-white">Your answer</h3>
          <p className="mt-1 text-sm text-slate-500">
            Provide clear, general legal information. Advise consulting an advocate for case-specific matters.
          </p>
          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <textarea
              rows={10}
              required
              className="w-full rounded-xl border px-3 py-2 dark:border-navy-700 dark:bg-navy-800"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your answer…"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Publishing…' : 'Publish answer'}
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/lawyer-dashboard/qa">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
