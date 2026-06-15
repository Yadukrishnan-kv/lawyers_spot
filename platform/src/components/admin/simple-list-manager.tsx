'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CmsData } from '@/lib/cms/types';
import { AdminInput, AdminSelect, SaveBar, useCmsSave } from '@/components/admin/cms-editor';
import { defaultCityState, getStateSelectOptions } from '@/components/admin/state-select-options';

type Field = {
  key: string;
  label: string;
  selectFrom?: 'states';
};

type ListSection = 'practiceAreas' | 'states' | 'cities' | 'qaPosts' | 'articles';

const NUMERIC_KEYS = new Set(['lawyers', 'answers', 'views']);
const BOOLEAN_KEYS = new Set(['trending', 'active']);

function makeDefaultItem(section: ListSection, cms: CmsData): Record<string, unknown> {
  const ts = Date.now();
  switch (section) {
    case 'practiceAreas':
      return { slug: `area-${ts}`, name: 'New Area', icon: 'Gavel', lawyers: 0 };
    case 'states':
      return { slug: `state-${ts}`, name: 'New State', code: 'XX', active: true };
    case 'cities':
      return { slug: `city-${ts}`, name: 'New City', state: defaultCityState(cms) };
    case 'qaPosts':
      return {
        id: String(ts),
        title: 'New legal question',
        excerpt: '',
        category: 'General',
        answers: 0,
        views: 0,
        slug: `qa-${ts}`,
        status: 'published',
      };
    case 'articles':
      return {
        slug: `article-${ts}`,
        title: 'New Article',
        excerpt: '',
        category: 'General',
        author: 'Legal Team',
        date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: '5 min',
        image: 'https://images.unsplash.com/photo-1589829545855-d10d557cf95f?w=800&h=500&fit=crop',
        trending: false,
        status: 'published',
      };
  }
}

export function SimpleListManager<T extends Record<string, unknown>>({
  initial,
  section,
  title,
  fields,
  idKey,
}: {
  initial: CmsData;
  section: ListSection;
  title: string;
  fields: Field[];
  idKey: string;
}) {
  const [cms, setCms] = useState(initial);
  const [items, setItems] = useState<T[]>(initial[section] as unknown as T[]);
  const { save, saving, message } = useCmsSave();

  async function handleSave() {
    const next = { ...cms, [section]: items };
    setCms(next);
    await save(next);
  }

  function updateItem(index: number, key: string, value: unknown) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  return (
    <div>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title mb-0">{title}</h3>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setItems([...items, makeDefaultItem(section, cms) as T])}
          >
            <Plus className="h-4 w-4 me-1 d-inline" /> Add
          </button>
        </div>
        <div className="card-body">
          <p className="text-muted mb-4">{items.length} {title.toLowerCase()}</p>
          <div className="row g-4">
            {items.map((item, index) => (
              <div key={String(item[idKey]) + index} className="col-12">
                <div className="card border">
                  <div className="card-header d-flex justify-content-end py-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setItems(items.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {fields.map((f) => {
                        const raw = String(item[f.key] ?? '');
                        const onChange = (v: string) => {
                          let value: unknown = v;
                          if (BOOLEAN_KEYS.has(f.key)) value = v === 'true' || v === '1';
                          else if (NUMERIC_KEYS.has(f.key)) value = Number(v);
                          updateItem(index, f.key, value);
                        };

                        if (f.selectFrom === 'states') {
                          return (
                            <div key={f.key} className="col-md-6">
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

                        return (
                          <div key={f.key} className="col-md-6">
                            <AdminInput label={f.label} value={raw} onChange={onChange} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saving} message={message} />
    </div>
  );
}
