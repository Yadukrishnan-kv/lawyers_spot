'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Article } from '@/lib/cms/types';
import { deleteLawyerArticle, fetchLawyerArticles } from '@/lib/user-auth';

export function LawyerArticlesManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await fetchLawyerArticles();
      setArticles(data.articles);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(slug: string) {
    if (!confirm('Delete this article?')) return;
    try {
      await deleteLawyerArticle(slug);
      setArticles((list) => list.filter((a) => a.slug !== slug));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading articles…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white">My articles</h2>
            <p className="mt-1 text-sm text-slate-500">Write and publish legal guides under your name.</p>
          </div>
          <Button asChild>
            <Link href="/lawyer-dashboard/articles/new">Write article</Link>
          </Button>
        </div>

        {articles.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No articles yet. Start by writing your first guide.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.slug} className="border-b border-slate-100 dark:border-navy-800">
                    <td className="py-3 pr-4 font-semibold">{article.title}</td>
                    <td className="py-3 pr-4">{article.category}</td>
                    <td className="py-3 pr-4 capitalize">{article.status ?? 'published'}</td>
                    <td className="py-3 pr-4">{article.date}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/lawyer-dashboard/articles/${encodeURIComponent(article.slug)}/edit`}
                          className="text-royal-600 hover:underline"
                        >
                          Edit
                        </Link>
                        {article.status === 'published' && (
                          <Link
                            href={`/articles/${article.slug}`}
                            className="text-slate-500 hover:underline"
                            target="_blank"
                          >
                            View
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => onDelete(article.slug)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
