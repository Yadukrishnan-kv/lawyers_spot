'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import type { CmsData } from '@/lib/cms/types';

export function useCmsSave() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function save(data: CmsData) {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');
      setMessage('Saved successfully');
      return true;
    } catch {
      setMessage('Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { save, saving, message, setMessage };
}

export function SaveBar({
  onSave,
  saving,
  message,
}: {
  onSave: () => void;
  saving: boolean;
  message: string;
}) {
  const alertClass = message.includes('Failed') ? 'alert-danger' : message ? 'alert-success' : 'alert-info';

  return (
    <div className="card sticky-bottom shadow-lg mt-4">
      <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
        <span className={`alert ${alertClass} mb-0 py-2 px-3 flex-grow-1`}>
          {message || 'Changes apply to the live website immediately'}
        </span>
        <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin me-1 d-inline" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 me-1 d-inline" /> Save changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function AdminInput({
  label,
  value,
  onChange,
  type = 'text',
  className,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className={className}>
      <label className="form-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
        placeholder={placeholder}
      />
    </div>
  );
}

export function AdminSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="form-label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
