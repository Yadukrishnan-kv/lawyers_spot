'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

type Props = {
  imageUrl: string;
  onChange: (url: string) => void;
};

export function ArticleCoverUpload({ imageUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/lawyer/upload/article-image', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; detail?: string };
      if (!res.ok) throw new Error(data.detail ?? 'Upload failed');
      if (data.url) onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="text-sm font-semibold">Cover image</label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
        {imageUrl ? (
          <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-navy-700">
            <Image src={imageUrl} alt="Cover preview" fill className="object-cover" sizes="192px" unoptimized />
          </div>
        ) : null}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-royal-300 hover:text-royal-600 disabled:opacity-50 dark:border-navy-700"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading…' : 'Upload cover image'}
          </button>
          <p className="mt-2 text-xs text-slate-500">JPEG, PNG, WebP or GIF · max 5 MB</p>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
