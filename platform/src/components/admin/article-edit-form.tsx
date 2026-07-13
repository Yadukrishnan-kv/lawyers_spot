'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { Article, CmsData } from '@/lib/cms/types';
import { AdminInput, SaveBar, useCmsSave } from '@/components/admin/cms-editor';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { Loader2, Upload } from 'lucide-react';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);

  function patch(p: Partial<Article>) {
    setArticle((a) => ({ ...a, ...p }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload/article-image', { method: 'POST', body: fd });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.detail || `Upload failed (${res.status})`);
      }
      const data = (await res.json()) as { url: string };
      patch({ image: data.url });
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (imageFileRef.current) imageFileRef.current.value = '';
    }
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
              <label className="form-label">Image</label>
              {article.image && (
                <div className="mb-2">
                  <img src={article.image} alt="Preview" className="img-thumbnail" style={{ maxHeight: 160 }} />
                </div>
              )}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => imageFileRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? <Loader2 className="h-4 w-4 me-1 animate-spin" /> : <Upload className="h-4 w-4 me-1" />}
                  {uploadingImage ? 'Uploading…' : 'Upload Image'}
                </button>
                {article.image && (
                  <button type="button" className="btn btn-outline-danger" onClick={() => patch({ image: '' })}>
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="d-none"
                onChange={handleImageUpload}
              />
            </div>
            <div className="col-12">
              <RichTextEditor
                label="Excerpt"
                value={article.excerpt ?? ''}
                onChange={(v) => patch({ excerpt: v })}
                placeholder="Write article excerpt…"
                minHeight={120}
              />
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
