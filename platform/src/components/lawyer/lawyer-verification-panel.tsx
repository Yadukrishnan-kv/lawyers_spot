'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { VerificationBadges } from '@/components/lawyer/verification-badges';
import type { Lawyer } from '@/lib/data-types';
import { fetchCurrentUser } from '@/lib/user-auth';

export function LawyerVerificationPanel() {
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await fetchCurrentUser();
        if (!user?.lawyerId) {
          setError('No lawyer profile linked to this account.');
          return;
        }
        const res = await fetch(`/api/lawyer/profile`, { credentials: 'include' });
        if (!res.ok) throw new Error('Could not load profile');
        const data = (await res.json()) as { lawyer: Lawyer };
        if (!cancelled) setLawyer(data.lawyer);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-slate-500">Loading verification status…</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !lawyer) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-slate-500">{error || 'Profile unavailable'}</p>
        </CardContent>
      </Card>
    );
  }

  const allVerified = lawyer.emailVerified && lawyer.phoneVerified;

  return (
    <Card>
      <CardContent>
        <h2 className="font-bold text-navy-900 dark:text-white">Account verification</h2>
        <p className="mt-1 text-sm text-slate-500">
          {allVerified
            ? 'Your email and mobile number are verified.'
            : 'Complete verification to build trust with clients.'}
        </p>
        <div className="mt-4">
          <VerificationBadges lawyer={lawyer} size="md" layout="stack" />
        </div>
        {!lawyer.emailVerified && (
          <p className="mt-3 text-xs text-slate-500">
            Email verification: contact support or wait for admin approval after you confirm your inbox.
          </p>
        )}
        {!lawyer.phoneVerified && lawyer.phone && (
          <p className="mt-2 text-xs text-slate-500">
            Mobile verification: an OTP will be sent when SMS verification is enabled.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
