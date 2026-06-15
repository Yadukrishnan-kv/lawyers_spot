'use client';

import { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  children: React.ReactNode;
  size?: 'md' | 'lg';
};

export function AdminFormModal({
  open,
  title,
  subtitle,
  onClose,
  onSave,
  saving = false,
  children,
  size = 'md',
}: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, saving, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={() => !saving && onClose()}
    >
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-navy-700 dark:bg-navy-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4 dark:border-navy-700 dark:bg-navy-900">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-navy-900 dark:text-white">
              {title}
            </h2>
            {subtitle && <p className="text-muted fs-12 mb-0 mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-2"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 dark:border-navy-700 dark:bg-navy-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
