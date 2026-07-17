'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCms } from '@/lib/cms/context';
import type { Lawyer } from '@/lib/data-types';
import { lawyerProfilePath } from '@/lib/lawyer-slug';
import { useUserSession } from '@/components/auth/user-session-provider';
import { fetchLawyerProfile, updateLawyerProfile } from '@/lib/user-auth';
import { Upload, Loader2 } from 'lucide-react';
import { TagInput } from '@/components/ui/tag-input';

export function LawyerProfileForm() {
  const { cities, practiceAreas } = useCms();
  const { refresh } = useUserSession();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLawyerProfile()
      .then((data) => setLawyer(data.lawyer))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lawyer) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = await updateLawyerProfile({
        name: lawyer.name,
        email: lawyer.email,
        phone: lawyer.phone,
        bio: lawyer.bio,
        firm: lawyer.firm,
        address: lawyer.address,
        fee: lawyer.fee,
        online: lawyer.online,
        practice: lawyer.practice,
        citySlug: lawyer.citySlug,
        languages: lawyer.languages,
        specialization: lawyer.specialization,
        image: lawyer.image,
      });
      setLawyer(data.lawyer);
      await refresh();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading profile…</p>;
  }

  if (error && !lawyer) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!lawyer) return null;

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/lawyer/upload/lawyer-image', { method: 'POST', body });
      const data = (await res.json()) as { url?: string; detail?: string };
      if (!res.ok) throw new Error(data.detail ?? 'Upload failed');
      if (!data.url) throw new Error('No image URL returned');
      const imageUrl = data.url;
      setLawyer((prev) => (prev ? { ...prev, image: imageUrl } : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const fieldClass =
    'mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800';

  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-navy-900 dark:text-white">Edit public profile</h2>
          <Link href={lawyerProfilePath(lawyer)} className="text-sm font-semibold text-royal-600">
            View live profile →
          </Link>
        </div>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {/* Photo */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                key={lawyer.image}
                src={lawyer.image || '/images/hero.svg'}
                alt="Profile"
                className="h-24 w-24 rounded-xl object-cover border dark:border-navy-700"
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/hero.svg'; }}
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/75 dark:bg-navy-900/75">
                  <Loader2 className="h-6 w-6 animate-spin text-royal-600" />
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImageUpload(f); }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1.5 h-4 w-4" />
                {uploading ? 'Uploading\u2026' : 'Upload photo'}
              </Button>
              <p className="mt-1 text-xs text-slate-500">JPEG, PNG, WebP or GIF · max 5 MB</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Full name</label>
              <input
                className={fieldClass}
                value={lawyer.name}
                onChange={(e) => setLawyer({ ...lawyer, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Firm</label>
              <input
                className={fieldClass}
                value={lawyer.firm ?? ''}
                onChange={(e) => setLawyer({ ...lawyer, firm: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Email</label>
              <input
                type="email"
                className={fieldClass}
                value={lawyer.email ?? ''}
                onChange={(e) => setLawyer({ ...lawyer, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Phone</label>
              <input
                type="tel"
                className={fieldClass}
                value={lawyer.phone ?? ''}
                onChange={(e) => setLawyer({ ...lawyer, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">City</label>
              <select
                className={fieldClass}
                value={lawyer.citySlug ?? ''}
                onChange={(e) => setLawyer({ ...lawyer, citySlug: e.target.value })}
              >
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}, {c.state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Primary practice</label>
              <select
                className={fieldClass}
                value={lawyer.practice}
                onChange={(e) => setLawyer({ ...lawyer, practice: e.target.value })}
              >
                {practiceAreas.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Consultation fee (INR)</label>
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={lawyer.fee ?? ''}
                onChange={(e) => setLawyer({ ...lawyer, fee: Number(e.target.value) || undefined })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={lawyer.online}
                  onChange={(e) => setLawyer({ ...lawyer, online: e.target.checked })}
                />
                Available for online consultations
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Office address</label>
            <input
              className={fieldClass}
              value={lawyer.address ?? ''}
              onChange={(e) => setLawyer({ ...lawyer, address: e.target.value })}
            />
          </div>
          <TagInput
            label="Languages"
            values={lawyer.languages ?? []}
            onChange={(v) => setLawyer({ ...lawyer, languages: v })}
            placeholder="Type a language and press Enter"
          />
          <TagInput
            label="Specializations"
            values={lawyer.specialization ?? []}
            onChange={(v) => setLawyer({ ...lawyer, specialization: v })}
            placeholder="Type a specialization and press Enter"
          />
          <div>
            <label className="text-sm font-semibold">Bio</label>
            <textarea
              rows={5}
              className="mt-1 w-full rounded-xl border px-3 py-2 dark:border-navy-700 dark:bg-navy-800"
              value={lawyer.bio ?? ''}
              onChange={(e) => setLawyer({ ...lawyer, bio: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
