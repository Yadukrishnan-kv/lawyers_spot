'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Article, CmsData } from '@/lib/cms/types';
import { AdminInput, SaveBar, useCmsSave } from '@/components/admin/cms-editor';

type Props = {
  initial: CmsData;
  article: Article;
  isNew?: boolean;
};

export function ArticleEditForm({ initial, article: initialArticle, isNew = false }: Props) {
  const router = useRouter();
  const [cms, setCms] = useState(initial);
  const [article, setArticle] = useState(initialArticle);
  const { save, saving, message } = useCmsSave();

  function patch(p: Partial<Article>) {
    setArticle((a) => ({ ...a, ...p }));
  }

  async function handleSave() {
    const articles = [...cms.articles];
    if (isNew) {
      if (articles.some((a) => a.slug === article.slug)) {
        alert('An article with this slug already exists.');
        return;
      }
      articles.push(article);
    } else {
      const idx = articles.findIndex((a) => a.slug === initialArticle.slug);
      if (idx < 0) return;
      articles[idx] = article;
    }
    const next = { ...cms, articles };
    const ok = await save(next);
    if (ok) {
      setCms(next);
      router.push('/admin/articles');
      router.refresh();
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <AdminInput label="Title" value={article.title} onChange={(v) => patch({ title: v })} />
            </div>
            <div className="col-md-6">
              <AdminInput label="Slug" value={article.slug} onChange={(v) => patch({ slug: v })} />
            </div>
            <div className="col-md-4">
              <AdminInput label="Category" value={article.category} onChange={(v) => patch({ category: v })} />
            </div>
            <div className="col-md-4">
              <AdminInput label="Author" value={article.author} onChange={(v) => patch({ author: v })} />
            </div>
            <div className="col-md-4">
              <AdminInput label="Read time" value={article.readTime} onChange={(v) => patch({ readTime: v })} />
            </div>
            <div className="col-md-6">
              <AdminInput label="Date" value={article.date} onChange={(v) => patch({ date: v })} />
            </div>
            <div className="col-md-6">
              <AdminInput label="Image URL" value={article.image} onChange={(v) => patch({ image: v })} />
            </div>
            <div className="col-12">
              <AdminInput label="Excerpt" value={article.excerpt} onChange={(v) => patch({ excerpt: v })} />
            </div>
            <div className="col-12">
              <label className="form-label">Content (HTML)</label>
              <textarea
                className="form-control font-monospace"
                rows={12}
                value={article.content ?? ''}
                onChange={(e) => patch({ content: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={article.trending}
                  onChange={(e) => patch({ trending: e.target.checked })}
                />
                <span className="form-check-label">Trending</span>
              </label>
            </div>
            <div className="col-md-6">
              <AdminInput
                label="Status"
                value={article.status ?? 'published'}
                onChange={(v) => patch({ status: v as Article['status'] })}
              />
            </div>
          </div>
          <div className="mt-4 d-flex gap-2">
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save article'}
            </button>
            <Link href="/admin/articles" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saving} message={message} />
    </div>
  );
}
