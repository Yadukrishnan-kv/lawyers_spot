'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { NavLink } from '@/lib/cms/types';
import { AdminInput } from '@/components/admin/cms-editor';

export function NavLinksEditor({
  label,
  links,
  onChange,
}: {
  label: string;
  links: NavLink[];
  onChange: (links: NavLink[]) => void;
}) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label mb-0">{label}</label>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => onChange([...links, { label: '', href: '/' }])}
        >
          <Plus className="h-4 w-4 me-1 d-inline" />
          Add link
        </button>
      </div>
      {links.map((link, i) => (
        <div key={i} className="row g-2 mb-2 align-items-end">
          <div className="col-md-5">
            <AdminInput
              label="Label"
              value={link.label}
              onChange={(v) => {
                const next = [...links];
                next[i] = { ...link, label: v };
                onChange(next);
              }}
            />
          </div>
          <div className="col-md-6">
            <AdminInput
              label="URL"
              value={link.href}
              onChange={(v) => {
                const next = [...links];
                next[i] = { ...link, href: v };
                onChange(next);
              }}
            />
          </div>
          <div className="col-md-1">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => onChange(links.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      {links.length === 0 && <p className="text-muted fs-12">No links yet.</p>}
    </div>
  );
}
