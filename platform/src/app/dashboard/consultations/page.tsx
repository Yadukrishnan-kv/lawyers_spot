'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Phone, Video, MapPin, Scale } from 'lucide-react';
import { fetchUserBookings } from '@/lib/user-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Booking = {
  id: string;
  lawyerId: string;
  lawyerName: string;
  lawyerImage: string;
  date: string;
  time: string;
  type: string;
  status: string;
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'gold' }> = {
  pending: { label: 'Pending', variant: 'default' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  completed: { label: 'Completed', variant: 'gold' },
  cancelled: { label: 'Cancelled', variant: 'default' },
};

function typeIcon(type: string) {
  if (type.toLowerCase().includes('video')) return <Video className="h-4 w-4" />;
  if (type.toLowerCase().includes('phone') || type.toLowerCase().includes('call'))
    return <Phone className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ConsultationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBookings()
      .then((data) => setBookings(data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const completed = bookings.filter((b) => b.status === 'completed');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  function renderSection(title: string, items: Booking[], emptyMsg: string) {
    return (
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-navy-700 dark:bg-navy-800/50">
          <h3 className="font-display text-base font-bold text-navy-900 dark:text-white">{title}</h3>
        </div>
        <CardContent className="p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-800">
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">{emptyMsg}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-navy-700">
              {items.map((b) => {
                const cfg = statusConfig[b.status] ?? { label: b.status, variant: 'default' as const };
                return (
                  <div
                    key={b.id}
                    className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={b.lawyerImage || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=48&h=48&fit=crop'}
                        alt={b.lawyerName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-navy-900 dark:text-white">{b.lawyerName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(b.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {b.time}
                        </span>
                        <span className="flex items-center gap-1">
                          {typeIcon(b.type)}
                          {b.type}
                        </span>
                      </div>
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-100 text-royal-600 dark:bg-royal-950/40 dark:text-royal-300">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">Consultations</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage your legal appointments</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/lawyers"><Scale className="h-4 w-4" />Book a Lawyer</Link>
        </Button>
      </div>
      {renderSection('Upcoming Consultations', upcoming, 'No upcoming consultations.')}
      {renderSection('Completed Consultations', completed, 'No completed consultations yet.')}
      {renderSection('Cancelled Consultations', cancelled, 'No cancelled consultations.')}
    </div>
  );
}
