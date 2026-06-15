'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CmsData, QaPost } from '@/lib/cms/types';
import { AdminInput, SaveBar, useCmsSave } from '@/components/admin/cms-editor';

type Props = {
  initial: CmsData;
  post: QaPost;
  isNew?: boolean;
};

export function QaEditForm({ initial, post: initialPost, isNew = false }: Props) {
  const router = useRouter();
  const [cms, setCms] = useState(initial);
  const [post, setPost] = useState(initialPost);
  const { save, saving, message } = useCmsSave();

  function patch(p: Partial<QaPost>) {
    setPost((q) => ({ ...q, ...p }));
  }

  async function handleSave() {
    const qaPosts = [...cms.qaPosts];
    if (isNew) {
      qaPosts.push(post);
    } else {
      const idx = qaPosts.findIndex((q) => q.id === initialPost.id);
      if (idx < 0) return;
      qaPosts[idx] = post;
    }
    const next = { ...cms, qaPosts };
    const ok = await save(next);
    if (ok) {
      setCms(next);
      router.push('/admin/qa');
      router.refresh();
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <AdminInput label="Title" value={post.title} onChange={(v) => patch({ title: v })} />
            </div>
            <div className="col-md-4">
              <AdminInput label="Category" value={post.category} onChange={(v) => patch({ category: v })} />
            </div>
            <div className="col-md-6">
              <AdminInput label="Slug" value={post.slug} onChange={(v) => patch({ slug: v })} />
            </div>
            <div className="col-md-3">
              <AdminInput
                label="Answers"
                type="number"
                value={String(post.answers)}
                onChange={(v) => patch({ answers: Number(v) || 0 })}
              />
            </div>
            <div className="col-md-3">
              <AdminInput
                label="Views"
                type="number"
                value={String(post.views)}
                onChange={(v) => patch({ views: Number(v) || 0 })}
              />
            </div>
            <div className="col-12">
              <AdminInput label="Excerpt" value={post.excerpt} onChange={(v) => patch({ excerpt: v })} />
            </div>
            <div className="col-12">
              <label className="form-label">Full content (HTML)</label>
              <textarea
                className="form-control font-monospace"
                rows={10}
                value={post.content ?? ''}
                onChange={(e) => patch({ content: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="Status"
                value={post.status ?? 'published'}
                onChange={(v) => patch({ status: v as QaPost['status'] })}
              />
            </div>
          </div>
          <div className="mt-4 d-flex gap-2">
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Q&A'}
            </button>
            <Link href="/admin/qa" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saving} message={message} />
    </div>
  );
}
