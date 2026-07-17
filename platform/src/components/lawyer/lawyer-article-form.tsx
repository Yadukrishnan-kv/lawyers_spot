'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCms } from '@/lib/cms/context';
import type { Article } from '@/lib/cms/types';
import { ArticleCoverUpload } from '@/components/lawyer/article-cover-upload';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import {
  createLawyerArticle,
  fetchLawyerArticle,
  updateLawyerArticle,
} from '@/lib/user-auth';

const DEFAULT_IMAGE = '/images/photo-1450101499163-c8848c66ca85.avif';

type Props = { slug?: string };

export function LawyerArticleForm({ slug }: Props) {
  const router = useRouter();
  const { practiceAreas } = useCms();
  const isNew = !slug;
  const [article, setArticle] = useState<Article>({
    slug: '',
    title: '',
    excerpt: '',
    category: practiceAreas[0]?.name ?? 'General',
    author: '',
    date: new Date().toISOString().slice(0, 10),
    readTime: '5 min',
    image: '',
    trending: false,
    status: 'draft',
    content: '',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetchLawyerArticle(slug)
      .then((data) => setArticle(data.article))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const articleToSave = {
        ...article,
        image: article.image || DEFAULT_IMAGE,
      };
      if (isNew) {
        await createLawyerArticle(articleToSave);
        router.push('/lawyer-dashboard/articles');
        router.refresh();
      } else {
        await updateLawyerArticle(slug!, {
          title: articleToSave.title,
          slug: articleToSave.slug,
          excerpt: articleToSave.excerpt,
          category: articleToSave.category,
          author: articleToSave.author,
          readTime: articleToSave.readTime,
          date: articleToSave.date,
          content: articleToSave.content,
          image: articleToSave.image,
          status: articleToSave.status,
        });
        router.push('/lawyer-dashboard/articles');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    'mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800';

  if (loading) return <p className="text-sm text-slate-500">Loading article…</p>;

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold text-navy-900 dark:text-white">
          {isNew ? 'Write new article' : 'Edit article'}
        </h2>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold">Title</label>
            <input
              className={fieldClass}
              value={article.title}
              onChange={(e) => setArticle({ ...article, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Slug</label>
            <input
              className={fieldClass}
              value={article.slug}
              onChange={(e) => setArticle({ ...article, slug: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Category</label>
              <select
                className={fieldClass}
                value={article.category}
                onChange={(e) => setArticle({ ...article, category: e.target.value })}
              >
                {practiceAreas.map((p) => (
                  <option key={p.slug} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Status</label>
              <select
                className={fieldClass}
                value={article.status ?? 'draft'}
                onChange={(e) =>
                  setArticle({ ...article, status: e.target.value as Article['status'] })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Author</label>
              <input
                className={fieldClass}
                value={article.author}
                onChange={(e) => setArticle({ ...article, author: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Read time</label>
              <input
                className={fieldClass}
                value={article.readTime}
                onChange={(e) => setArticle({ ...article, readTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <RichTextEditor
              label="Excerpt"
              value={article.excerpt ?? ''}
              onChange={(v) => setArticle({ ...article, excerpt: v })}
              placeholder="Write article excerpt…"
              minHeight={120}
            />
          </div>
          <ArticleCoverUpload
            imageUrl={article.image}
            onChange={(url) => setArticle({ ...article, image: url })}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create article' : 'Save changes'}
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/lawyer-dashboard/articles">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
