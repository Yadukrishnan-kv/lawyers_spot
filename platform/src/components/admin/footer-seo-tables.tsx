'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { CmsData, GuideEntry, QaCategory } from '@/lib/cms/types';
import { AdminInput } from '@/components/admin/cms-editor';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import { AdminFormModal } from '@/components/admin/admin-form-modal';

type Props = {
  cms: CmsData;
  onCmsChange: (cms: CmsData) => void;
};

export function FooterSeoTables({ cms, onCmsChange }: Props) {
  const sc = cms.siteContent;

  return (
    <div className="row g-4">
      <div className="col-12">
        <GuidesTable
          guides={sc.legalGuides}
          onChange={(legalGuides) => onCmsChange({ ...cms, siteContent: { ...sc, legalGuides } })}
        />
      </div>
      <div className="col-12">
        <QaTopicsTable
          topics={sc.qaCategories}
          onChange={(qaCategories) => onCmsChange({ ...cms, siteContent: { ...sc, qaCategories } })}
        />
      </div>
    </div>
  );
}

function GuidesTable({
  guides,
  onChange,
}: {
  guides: GuideEntry[];
  onChange: (g: GuideEntry[]) => void;
}) {
  const [editing, setEditing] = useState<GuideEntry | null>(null);
  const [editIndex, setEditIndex] = useState(-1);

  function saveModal() {
    if (!editing) return;
    if (editIndex >= 0) onChange(guides.map((g, i) => (i === editIndex ? editing : g)));
    else onChange([...guides, editing]);
    setEditing(null);
    setEditIndex(-1);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label mb-0 fw-semibold">Featured law guides</label>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => {
            setEditing({ slug: `guide-${Date.now()}`, title: 'New Guide', category: 'General' });
            setEditIndex(-1);
          }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <AdminDataTable
        rows={guides}
        rowKey={(g) => g.slug}
        pageSize={8}
        columns={[
          { key: 'title', header: 'Title', render: (g) => g.title },
          { key: 'slug', header: 'Article slug', render: (g) => <code className="fs-12">{g.slug}</code> },
          { key: 'category', header: 'Category', render: (g) => g.category },
        ]}
        onEdit={(g) => {
          setEditing({ ...g });
          setEditIndex(guides.indexOf(g));
        }}
        onDelete={(g) => onChange(guides.filter((x) => x.slug !== g.slug))}
      />
      <AdminFormModal
        open={!!editing}
        title={editIndex >= 0 ? 'Edit guide link' : 'Add guide link'}
        onClose={() => {
          setEditing(null);
          setEditIndex(-1);
        }}
        onSave={saveModal}
      >
        {editing && (
          <>
            <AdminInput label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
            <div className="mt-3">
              <AdminInput label="Article slug" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
            </div>
            <div className="mt-3">
              <AdminInput label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} />
            </div>
          </>
        )}
      </AdminFormModal>
    </div>
  );
}

function QaTopicsTable({
  topics,
  onChange,
}: {
  topics: QaCategory[];
  onChange: (t: QaCategory[]) => void;
}) {
  const [editing, setEditing] = useState<QaCategory | null>(null);
  const [editIndex, setEditIndex] = useState(-1);

  function saveModal() {
    if (!editing) return;
    if (editIndex >= 0) onChange(topics.map((c, i) => (i === editIndex ? editing : c)));
    else onChange([...topics, editing]);
    setEditing(null);
    setEditIndex(-1);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label mb-0 fw-semibold">Q&A topic links</label>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => {
            setEditing({ slug: `topic-${Date.now()}`, name: 'New Topic', count: 0 });
            setEditIndex(-1);
          }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <AdminDataTable
        rows={topics}
        rowKey={(c) => c.slug}
        pageSize={8}
        columns={[
          { key: 'name', header: 'Name', render: (c) => c.name },
          { key: 'slug', header: 'Slug', render: (c) => <code className="fs-12">{c.slug}</code> },
          { key: 'count', header: 'Count label', render: (c) => String(c.count) },
        ]}
        onEdit={(c) => {
          setEditing({ ...c });
          setEditIndex(topics.indexOf(c));
        }}
        onDelete={(c) => onChange(topics.filter((x) => x.slug !== c.slug))}
      />
      <AdminFormModal
        open={!!editing}
        title={editIndex >= 0 ? 'Edit Q&A topic' : 'Add Q&A topic'}
        onClose={() => {
          setEditing(null);
          setEditIndex(-1);
        }}
        onSave={saveModal}
      >
        {editing && (
          <>
            <AdminInput label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <div className="mt-3">
              <AdminInput label="Slug" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
            </div>
            <div className="mt-3">
              <AdminInput
                label="Count label"
                type="number"
                value={String(editing.count)}
                onChange={(v) => setEditing({ ...editing, count: Number(v) || 0 })}
              />
            </div>
          </>
        )}
      </AdminFormModal>
    </div>
  );
}
