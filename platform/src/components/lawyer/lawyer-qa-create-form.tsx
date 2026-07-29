'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCms } from '@/lib/cms/context';
import { createLawyerQaPost } from '@/lib/user-auth';

export function LawyerQaCreateForm() {
  const router = useRouter();
  const { practiceAreas } = useCms();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState(practiceAreas[0]?.name ?? 'General');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fieldClass =
    'mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createLawyerQaPost({ title, excerpt, category, content: content || undefined });
      router.push('/lawyer-dashboard/qa');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold text-navy-900 dark:text-white">Create Q&amp;A</h2>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold">Title</label>
            <input
              className={fieldClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Category</label>
            <select
              className={fieldClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {practiceAreas.map((p) => (
                <option key={p.slug} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Short description</label>
            <textarea
              className="mt-1 min-h-[100px] w-full rounded-xl border px-3 py-2 dark:border-navy-700 dark:bg-navy-800"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Create Q&amp;A'}
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/lawyer-dashboard/qa">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
