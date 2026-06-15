'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { CmsData, City } from '@/lib/cms/types';
import { AdminInput, AdminSelect, useCmsSave } from '@/components/admin/cms-editor';
import { AdminDataTable } from '@/components/admin/admin-data-table';
import { AdminFormModal } from '@/components/admin/admin-form-modal';
import { defaultCityState, getStateSelectOptions } from '@/components/admin/state-select-options';

export function CitiesManager({ initial }: { initial: CmsData }) {
  const [cms, setCms] = useState(initial);
  const [editing, setEditing] = useState<City | null>(null);
  const [editIndex, setEditIndex] = useState(-1);
  const { save, saving } = useCmsSave();

  async function persistCities(list: City[]) {
    const next = { ...cms, cities: list };
    setCms(next);
    await save(next);
  }

  function openEdit(city: City) {
    setEditing({ ...city });
    setEditIndex(cms.cities.indexOf(city));
  }

  async function saveModal() {
    if (!editing) return;
    let list: City[];
    if (editIndex >= 0) {
      list = cms.cities.map((c, i) => (i === editIndex ? editing : c));
    } else {
      list = [...cms.cities, editing];
    }
    await persistCities(list);
    setEditing(null);
    setEditIndex(-1);
  }

  return (
    <div>
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 className="card-title mb-0">Cities</h3>
            <p className="text-muted mb-0 fs-12">{cms.cities.length} cities</p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditing({
                slug: `city-${Date.now()}`,
                name: 'New City',
                state: defaultCityState(cms),
              });
              setEditIndex(-1);
            }}
          >
            <Plus className="h-4 w-4 me-1 d-inline" /> Add city
          </button>
        </div>
        <div className="card-body">
          <AdminDataTable
            rows={cms.cities}
            rowKey={(c) => c.slug}
            columns={[
              { key: 'name', header: 'City name', render: (c) => <span className="fw-semibold">{c.name}</span> },
              { key: 'state', header: 'State', render: (c) => c.state || '—' },
              { key: 'slug', header: 'Slug', render: (c) => <code className="fs-12">{c.slug}</code> },
            ]}
            onEdit={openEdit}
            onDelete={async (c) => {
              if (!confirm('Delete this city?')) return;
              await persistCities(cms.cities.filter((x) => x.slug !== c.slug));
            }}
          />
        </div>
      </div>

      <AdminFormModal
        open={!!editing}
        title={editIndex >= 0 ? 'Edit city' : 'Add city'}
        onClose={() => {
          setEditing(null);
          setEditIndex(-1);
        }}
        onSave={saveModal}
        saving={saving}
      >
        {editing && (
          <div className="row g-3">
            <div className="col-12">
              <AdminInput label="City name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            </div>
            <div className="col-12">
              <AdminSelect
                label="State"
                value={editing.state}
                onChange={(v) => setEditing({ ...editing, state: v })}
                options={getStateSelectOptions(cms, editing.state)}
                placeholder="Select state"
              />
            </div>
            <div className="col-12">
              <AdminInput label="Slug (URL)" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
            </div>
          </div>
        )}
      </AdminFormModal>
    </div>
  );
}
