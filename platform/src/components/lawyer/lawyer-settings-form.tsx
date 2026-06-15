'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { changeLawyerPassword } from '@/lib/user-auth';

export function LawyerSettingsForm() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const currentPassword = String(fd.get('currentPassword'));
    const newPassword = String(fd.get('newPassword'));
    const confirm = String(fd.get('confirm'));
    if (newPassword !== confirm) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await changeLawyerPassword(currentPassword, newPassword);
      setSuccess('Password changed successfully.');
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    'mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800';

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold text-navy-900 dark:text-white">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">Use at least 8 characters for your new password.</p>
        <form className="mt-6 max-w-md space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold">Current password</label>
            <input name="currentPassword" type="password" required className={fieldClass} />
          </div>
          <div>
            <label className="text-sm font-semibold">New password</label>
            <input name="newPassword" type="password" required minLength={8} className={fieldClass} />
          </div>
          <div>
            <label className="text-sm font-semibold">Confirm new password</label>
            <input name="confirm" type="password" required minLength={8} className={fieldClass} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
