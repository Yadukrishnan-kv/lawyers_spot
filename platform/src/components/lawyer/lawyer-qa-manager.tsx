'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { QaAnswer } from '@/lib/cms/types';
import {
  deleteLawyerQaAnswer,
  fetchLawyerQaAnswers,
  fetchLawyerQaQuestions,
  type LawyerQaQuestion,
} from '@/lib/user-auth';

export function LawyerQaManager() {
  const [tab, setTab] = useState<'questions' | 'answers'>('questions');
  const [questions, setQuestions] = useState<LawyerQaQuestion[]>([]);
  const [answers, setAnswers] = useState<QaAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [qData, aData] = await Promise.all([fetchLawyerQaQuestions(), fetchLawyerQaAnswers()]);
      setQuestions(qData.questions);
      setAnswers(aData.answers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load Q&A');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDeleteAnswer(id: string) {
    if (!confirm('Remove your answer?')) return;
    try {
      await deleteLawyerQaAnswer(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading Q&A…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold text-navy-900 dark:text-white">Q&amp;A</h2>
        <p className="mt-1 text-sm text-slate-500">
          Browse public legal questions and publish answers as a verified advocate.
        </p>

        <div className="mt-6 flex gap-2">
          {(['questions', 'answers'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-semibold',
                tab === key
                  ? 'bg-royal-500/10 text-royal-700'
                  : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-navy-800',
              )}
            >
              {key === 'questions' ? 'Browse questions' : 'My answers'}
            </button>
          ))}
        </div>

        {tab === 'questions' && (
          <div className="mt-6 space-y-3">
            {questions.length === 0 ? (
              <p className="text-sm text-slate-500">No published questions yet.</p>
            ) : (
              questions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-navy-700"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-royal-600">{q.category}</p>
                      <h3 className="mt-1 font-semibold text-navy-900 dark:text-white">{q.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">{q.excerpt}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {q.answers} answers · {q.views} views
                      </p>
                    </div>
                    <Link
                      href={`/lawyer-dashboard/qa/${encodeURIComponent(q.id)}`}
                      className="shrink-0 rounded-lg bg-royal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-royal-700"
                    >
                      {q.answeredByMe ? 'Edit reply' : 'Reply'}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'answers' && (
          <div className="mt-6 space-y-3">
            {answers.length === 0 ? (
              <p className="text-sm text-slate-500">You have not answered any questions yet.</p>
            ) : (
              answers.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-navy-700"
                >
                  <p className="text-xs font-bold uppercase text-royal-600">{a.questionCategory}</p>
                  <h3 className="mt-1 font-semibold">{a.questionTitle}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{a.body}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    <Link
                      href={`/lawyer-dashboard/qa/${encodeURIComponent(a.qaPostId)}`}
                      className="font-semibold text-royal-600 hover:underline"
                    >
                      Edit
                    </Link>
                    {a.questionSlug && (
                      <Link
                        href={`/qa/${a.questionSlug}`}
                        className="text-slate-500 hover:underline"
                        target="_blank"
                      >
                        View public page
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteAnswer(a.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
