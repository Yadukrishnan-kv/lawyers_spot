'use client';

import { useEffect, useState } from 'react';
import { Settings, User, Mail, Phone, MapPin, Save, Camera } from 'lucide-react';
import { fetchUserProfile, updateUserProfile, fetchCurrentUser } from '@/lib/user-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    profileImage: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUserProfile();
        if (data) {
          setProfile(data);
          setName(data.name);
          setPhone(data.phone ?? '');
          setAddress(data.address ?? '');
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const data = await updateUserProfile({ name, phone, address });
      setMessage('Profile updated successfully.');
      if (data.profile) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                name: data.profile.name as string,
                phone: data.profile.phone as string | null,
                address: data.profile.address as string | null,
              }
            : prev,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage your account preferences</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-navy-700 dark:bg-navy-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-royal-100 to-royal-200 text-lg font-bold text-royal-700 dark:from-royal-950/50 dark:to-royal-900/50 dark:text-royal-300">
              {profile?.profileImage ? (
                <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
              ) : (
                profile?.name?.charAt(0)?.toUpperCase() ?? '?'
              )}
            </div>
            <div>
              <p className="font-semibold text-navy-900 dark:text-white">{profile?.name}</p>
              <p className="text-xs text-slate-500">{profile?.email}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy-900 dark:text-white">
                <User className="h-4 w-4 text-royal-600" /> Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy-900 dark:text-white">
                <Mail className="h-4 w-4 text-royal-600" /> Email
              </label>
              <input
                type="email"
                value={profile?.email ?? ''}
                disabled
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-slate-400"
              />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy-900 dark:text-white">
                <Phone className="h-4 w-4 text-royal-600" /> Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy-900 dark:text-white">
                <MapPin className="h-4 w-4 text-royal-600" /> Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              />
            </div>

            {message && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                {message}
              </p>
            )}
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-navy-700">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
