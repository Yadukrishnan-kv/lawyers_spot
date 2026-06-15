'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { AdminInput } from '@/components/admin/cms-editor';

type Props = {
  lawyerId: string;
  imageUrl: string;
  onChange: (url: string) => void;
};

export function LawyerPhotoField({ lawyerId, imageUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('lawyerId', lawyerId);

      const res = await fetch('/api/admin/upload/lawyer-image', {
        method: 'POST',
        body,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      if (!data.url) throw new Error('No image URL returned');
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="text-center">
      <div className="position-relative d-inline-block mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={imageUrl}
          src={imageUrl || '/images/hero.svg'}
          alt="Profile"
          width={140}
          height={140}
          className="rounded-lg object-cover border"
          style={{ width: 140, height: 140 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/hero.svg';
          }}
        />
        {uploading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-lg"
            style={{ background: 'rgba(255,255,255,0.75)' }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="d-none"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <div className="mt-3 d-grid gap-2">
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4 me-1 d-inline" />
          {uploading ? 'Uploading…' : 'Upload new photo'}
        </button>
        <p className="text-muted fs-12 mb-0">JPEG, PNG, WebP or GIF · max 5 MB</p>
      </div>

      <div className="mt-3 text-start">
        <AdminInput
          label="Or paste image URL"
          value={imageUrl}
          onChange={onChange}
        />
      </div>

      {error && <p className="text-danger fs-12 mt-2 mb-0">{error}</p>}
      <p className="text-muted fs-12 mt-2 mb-0">
        Click <strong>Apply &amp; save</strong> below to publish changes.
      </p>
    </div>
  );
}
