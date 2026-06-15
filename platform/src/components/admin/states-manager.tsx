'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { CmsData, StateEntry } from '@/lib/cms/types';
import { AdminInput, useCmsSave } from '@/components/admin/cms-editor';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import { AdminFormModal } from '@/components/admin/admin-form-modal';

export function StatesManager({ initial }: { initial: CmsData }) {
  const [cms, setCms] = useState(initial);
  const [editing, setEditing] = useState<StateEntry | null>(null);
  const [editIndex, setEditIndex] = useState(-1);
  const { save, saving } = useCmsSave();
  const activeCount = cms.states.filter((s) => s.active).length;

  async function persistStates(list: StateEntry[]) {
    const next = { ...cms, states: list };
    setCms(next);
    await save(next);
  }

  async function saveModal() {
    if (!editing) return;
    let list: StateEntry[];
    if (editIndex >= 0) {
      list = cms.states.map((s, i) => (i === editIndex ? editing : s));
    } else {
      list = [...cms.states, editing];
    }
    await persistStates(list);
    setEditing(null);
    setEditIndex(-1);
  }

  return (
    <div>
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 className="card-title mb-0">States</h3>
            <p className="text-muted mb-0 fs-12">
              {cms.states.length} states · {activeCount} active
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditing({
                slug: `state-${Date.now()}`,
                name: 'New State',
                code: 'XX',
                active: true,
              });
              setEditIndex(-1);
            }}
          >
            <Plus className="h-4 w-4 me-1 d-inline" /> Add state
          </button>
        </div>
        <div className="card-body">
          <AdminDataTable
            rows={cms.states}
            rowKey={(s) => s.slug}
            columns={[
              { key: 'name', header: 'State name', render: (s) => <span className="fw-semibold">{s.name}</span> },
              { key: 'code', header: 'Code', render: (s) => <code>{s.code}</code> },
              { key: 'active', header: 'Active', render: (s) => (s.active ? 'Yes' : 'No') },
            ]}
            onEdit={(s) => {
              setEditing({ ...s });
              setEditIndex(cms.states.indexOf(s));
            }}
            onDelete={async (s) => {
              if (!confirm('Delete this state?')) return;
              await persistStates(cms.states.filter((x) => x.slug !== s.slug));
            }}
          />
        </div>
      </div>

      <AdminFormModal
        open={!!editing}
        title={editIndex >= 0 ? 'Edit state' : 'Add state'}
        onClose={() => {
          setEditing(null);
          setEditIndex(-1);
        }}
        onSave={saveModal}
        saving={saving}
      >
        {editing && (
          <div className="row g-3">
            <div className="col-md-6">
              <AdminInput label="Slug" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
            </div>
            <div className="col-md-6">
              <AdminInput label="State name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            </div>
            <div className="col-md-6">
              <AdminInput
                label="Code"
                value={editing.code}
                onChange={(v) => setEditing({ ...editing, code: v.toUpperCase() })}
              />
            </div>
            <div className="col-12">
              <label className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                <span className="form-check-label">Active (shown in city dropdowns)</span>
              </label>
            </div>
          </div>
        )}
      </AdminFormModal>
    </div>
  );
}
