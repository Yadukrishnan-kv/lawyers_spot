'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { CmsData } from '@/lib/cms/types';
import { AdminInput, AdminSelect, SaveBar, useCmsSave } from '@/components/admin/cms-editor';
import { AdminDataTable, type AdminTableColumn } from '@/components/admin/admin-data-table';
import { AdminFormModal } from '@/components/admin/admin-form-modal';
import { defaultCityState, getStateSelectOptions } from '@/components/admin/state-select-options';
import { makeDefaultItem, type ListSection } from '@/components/admin/list-section-utils';

export type ListField = {
  key: string;
  label: string;
  selectFrom?: 'states';
  type?: 'text' | 'number' | 'textarea';
};

type Props<T extends Record<string, unknown>> = {
  initial: CmsData;
  section: ListSection;
  title: string;
  idKey: keyof T & string;
  fields: ListField[];
  columns: AdminTableColumn<T>[];
  editMode: 'modal' | 'page';
  editPath?: (item: T) => string;
  newPath?: string;
  pageSize?: number;
};

export function TableListManager<T extends Record<string, unknown>>({
  initial,
  section,
  title,
  idKey,
  fields,
  columns,
  editMode,
  editPath,
  newPath,
  pageSize = 10,
}: Props<T>) {
  const router = useRouter();
  const [cms, setCms] = useState(initial);
  const [items, setItems] = useState<T[]>(initial[section] as unknown as T[]);
  const [editing, setEditing] = useState<T | null>(null);
  const [editIndex, setEditIndex] = useState(-1);
  const { save, saving, message } = useCmsSave();

  async function persistList(list: T[]) {
    const next = { ...cms, [section]: list };
    setCms(next);
    setItems(list);
    await save(next);
  }

  function openEdit(item: T, index: number) {
    if (editMode === 'page' && editPath) {
      router.push(editPath(item));
      return;
    }
    setEditing({ ...item });
    setEditIndex(index);
  }

  function addNew() {
    if (editMode === 'page' && newPath) {
      router.push(newPath);
      return;
    }
    const item = makeDefaultItem(section, cms) as T;
    setEditing(item);
    setEditIndex(-1);
  }

  async function saveModal() {
    if (!editing) return;
    let list: T[];
    if (editIndex >= 0) {
      list = items.map((item, i) => (i === editIndex ? editing : item));
    } else {
      list = [...items, editing];
    }
    await persistList(list);
    setEditing(null);
    setEditIndex(-1);
  }

  async function remove(item: T) {
    if (!confirm('Delete this item?')) return;
    const key = String(item[idKey]);
    await persistList(items.filter((row) => String(row[idKey]) !== key));
  }

  function updateField(key: string, value: unknown) {
    if (!editing) return;
    setEditing({ ...editing, [key]: value });
  }

  return (
    <div>
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 className="card-title mb-0">{title}</h3>
            <p className="text-muted mb-0 fs-12">{items.length} records</p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={addNew}>
            <Plus className="h-4 w-4 me-1 d-inline" /> Add
          </button>
        </div>
        <div className="card-body">
          <AdminDataTable
            rows={items}
            rowKey={(row) => String(row[idKey])}
            columns={columns}
            pageSize={pageSize}
            editHref={editMode === 'page' && editPath ? editPath : undefined}
            onEdit={editMode === 'modal' ? (row) => openEdit(row, items.indexOf(row)) : undefined}
            onDelete={remove}
          />
        </div>
      </div>

      {editMode === 'modal' && (
        <AdminFormModal
          open={!!editing}
          title={editIndex >= 0 ? `Edit ${title.replace(/s$/, '')}` : `Add ${title.replace(/s$/, '')}`}
          onClose={() => {
            setEditing(null);
            setEditIndex(-1);
          }}
          onSave={saveModal}
          saving={saving}
          size={fields.length > 4 ? 'lg' : 'md'}
        >
          <div className="row g-3">
            {fields.map((f) => {
              const raw = String(editing?.[f.key] ?? '');
              const onChange = (v: string) => {
                let value: unknown = v;
                if (f.key === 'active' || f.key === 'trending') value = v === 'true' || v === '1';
                else if (f.type === 'number' || ['lawyers', 'answers', 'views'].includes(f.key)) {
                  value = Number(v) || 0;
                }
                updateField(f.key, value);
              };

              if (f.selectFrom === 'states') {
                return (
                  <div key={f.key} className="col-12">
                    <AdminSelect
                      label={f.label}
                      value={raw}
                      onChange={onChange}
                      options={getStateSelectOptions(cms, raw)}
                      placeholder="Select state"
                    />
                  </div>
                );
              }

              if (f.type === 'textarea') {
                return (
                  <div key={f.key} className="col-12">
                    <label className="form-label">{f.label}</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={raw}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  </div>
                );
              }

              return (
                <div key={f.key} className="col-md-6">
                  <AdminInput
                    label={f.label}
                    value={raw}
                    onChange={onChange}
                    type={f.type === 'number' ? 'number' : 'text'}
                  />
                </div>
              );
            })}
          </div>
        </AdminFormModal>
      )}

      <SaveBar onSave={async () => persistList(items)} saving={saving} message={message} />
    </div>
  );
}
