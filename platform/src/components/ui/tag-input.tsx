'use client';

import { type KeyboardEvent, useState } from 'react';
import { X } from 'lucide-react';

type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export function TagInput({ label, values, onChange, placeholder }: Props) {
  const [input, setInput] = useState('');

  function add(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) return;
    onChange([...values, trimmed]);
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
      setInput('');
    }
  }

  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <div className="mt-1 flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border px-3 py-1.5 dark:border-navy-700 dark:bg-navy-800">
        {values.map((v, i) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-lg bg-royal-50 px-2 py-0.5 text-sm text-royal-700 dark:bg-royal-950/30 dark:text-royal-300"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(i)}
              className="inline-flex hover:text-royal-900 dark:hover:text-royal-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          className="min-w-[120px] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => { if (input.trim()) { add(input); setInput(''); } }}
          placeholder={placeholder ?? `Type and press Enter`}
        />
      </div>
    </div>
  );
}
