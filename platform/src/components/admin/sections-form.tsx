'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminInput, AdminSelect } from '@/components/admin/cms-editor';
import type { SectionRecord } from '@/lib/sections-data';

type Props = {
  type: 'ipc' | 'bns';
  initial?: SectionRecord | null;
};

export function SectionsForm({ type, initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial;
  const prefix = type === 'ipc' ? 'IPC' : 'BNS';

  const [sectionNumber, setSectionNumber] = useState(initial?.sectionNumber ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [punishment, setPunishment] = useState(initial?.punishment ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'active');
  const [displayOrder, setDisplayOrder] = useState(String(initial?.displayOrder ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function autoGenerateSlug() {
    if (isEdit) return;
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const val = base.startsWith(`${type}-section`) ? base : `${type}-${base}`;
    setSlug(val.slice(0, 80));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }
    if (!slug.trim()) {
      setError('Slug is required');
      setSaving(false);
      return;
    }

    const payload = {
      type,
      section_number: sectionNumber,
      title: title.trim(),
      slug: slug.trim(),
      body,
      punishment,
      category,
      status,
      display_order: Number(displayOrder) || 0,
    };

    try {
      const url = isEdit
        ? `/api/admin/sections/${initial!.id}`
        : '/api/admin/sections';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || err.error || 'Failed to save');
      }
      router.push(`/admin/sections/${type}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger py-2">{error}</div>
          )}

          <div className="row g-3">
            <div className="col-md-6">
              <AdminInput
                label={`${prefix} Section Number`}
                value={sectionNumber}
                onChange={(v) => setSectionNumber(v)}
                placeholder="e.g. 498A, 302"
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="Display Order"
                value={displayOrder}
                onChange={(v) => setDisplayOrder(v)}
                type="number"
              />
            </div>
            <div className="col-12">
              <AdminInput
                label="Section Title"
                value={title}
                onChange={(v) => {
                  setTitle(v);
                  if (!isEdit) autoGenerateSlug();
                }}
                placeholder={`e.g. ${prefix} Section 498A`}
              />
            </div>
            <div className="col-md-8">
              <AdminInput
                label="Slug"
                value={slug}
                onChange={(v) => setSlug(v)}
                placeholder="e.g. ipc-section-498a"
              />
            </div>
            <div className="col-md-4">
              <AdminSelect
                label="Status"
                value={status}
                onChange={(v) => setStatus(v)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="Category (optional)"
                value={category}
                onChange={(v) => setCategory(v)}
                placeholder="e.g. Criminal Law, Family Law"
              />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="Punishment (optional)"
                value={punishment}
                onChange={(v) => setPunishment(v)}
                placeholder="e.g. Up to 3 years imprisonment"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Body / Description (HTML)</label>
              <textarea
                className="form-control font-monospace"
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="<p>Section description in HTML...</p>"
              />
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push(`/admin/sections/${type}`)}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Section' : 'Create Section'}
          </button>
        </div>
      </div>
    </form>
  );
}
