'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { NavLink } from '@/lib/cms/types';
import { AdminInput } from '@/components/admin/cms-editor';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import { AdminFormModal } from '@/components/admin/admin-form-modal';

type Props = {
  label: string;
  links: NavLink[];
  onChange: (links: NavLink[]) => void;
};

export function NavLinksTable({ label, links, onChange }: Props) {
  const [editing, setEditing] = useState<NavLink | null>(null);
  const [editIndex, setEditIndex] = useState(-1);

  function saveModal() {
    if (!editing) return;
    if (editIndex >= 0) {
      onChange(links.map((l, i) => (i === editIndex ? editing : l)));
    } else {
      onChange([...links, editing]);
    }
    setEditing(null);
    setEditIndex(-1);
  }

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label mb-0 fw-semibold">{label}</label>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => {
            setEditing({ label: '', href: '/' });
            setEditIndex(-1);
          }}
        >
          <Plus className="h-4 w-4 me-1 d-inline" />
          Add link
        </button>
      </div>
      <AdminDataTable
        rows={links}
        rowKey={(l) => `${l.href}|${l.label}`}
        pageSize={8}
        columns={[
          { key: 'label', header: 'Label', render: (l) => l.label },
          {
            key: 'href',
            header: 'URL',
            render: (l) => <code className="fs-12">{l.href}</code>,
          },
        ]}
        onEdit={(l) => {
          setEditing({ ...l });
          setEditIndex(links.indexOf(l));
        }}
        onDelete={(l) => onChange(links.filter((x) => x !== l))}
      />

      <AdminFormModal
        open={!!editing}
        title={editIndex >= 0 ? 'Edit link' : 'Add link'}
        onClose={() => {
          setEditing(null);
          setEditIndex(-1);
        }}
        onSave={saveModal}
      >
        <AdminInput
          label="Label"
          value={editing?.label ?? ''}
          onChange={(v) => setEditing((e) => ({ ...(e ?? { label: '', href: '/' }), label: v }))}
        />
        <div className="mt-3">
          <AdminInput
            label="URL"
            value={editing?.href ?? ''}
            onChange={(v) => setEditing((e) => ({ ...(e ?? { label: '', href: '/' }), href: v }))}
          />
        </div>
      </AdminFormModal>
    </div>
  );
}
