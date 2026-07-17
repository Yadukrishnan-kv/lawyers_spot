'use client';

import { useEffect, useState } from 'react';
import {
  Calendar, Clock, Mail, Video, Phone, CheckCircle2, XCircle, AlertCircle, Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type Booking = {
  id: string;
  userId: string | null;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'cancelled';
};

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      const res = await fetch('/api/lawyer/bookings');
      if (!res.ok) throw new Error('Failed to load appointments');
      const data = await res.json() as { bookings: Booking[] };
      setBookings(data.bookings || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, newStatus: 'confirmed' | 'cancelled') {
    if (!confirm(`Are you sure you want to ${newStatus === 'confirmed' ? 'confirm' : 'cancel'} this appointment?`)) {
      return;
    }
    try {
      setActioningId(id);
      const res = await fetch(`/api/lawyer/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Failed to update appointment to ${newStatus}`);
      
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Appointments</h2>
        <p className="mt-1 text-sm text-slate-500">Manage and track your client consultations.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-royal-600 dark:text-royal-300" />
        </div>
      ) : error ? (
        <Card className="border-red-100 bg-red-50/50">
          <CardContent className="flex items-center gap-3 p-4 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </CardContent>
        </Card>
      ) : bookings.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 dark:bg-navy-900">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-semibold text-navy-900 dark:text-white">No appointments found</p>
            <p className="mt-1 text-xs text-slate-500">When clients book consultations with you, they will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden border border-slate-200 bg-white transition hover:shadow-sm dark:border-navy-700 dark:bg-navy-900">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                        booking.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-300'
                          : booking.status === 'cancelled'
                          ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/20 dark:text-red-300'
                          : 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-950/20 dark:text-amber-300'
                      }`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold text-navy-900 dark:text-white">{booking.clientName}</h3>
                  </div>

                  <span className="text-xs text-slate-400">ID: {booking.id}</span>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-navy-800 dark:text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{booking.clientEmail}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{booking.date}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{booking.time}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {booking.type.toLowerCase().includes('video') ? (
                      <Video className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Phone className="h-4 w-4 text-slate-400" />
                    )}
                    <span>{booking.type}</span>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="mt-6 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={actioningId === booking.id}
                      onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors disabled:opacity-50"
                    >
                      {actioningId === booking.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Confirm
                    </button>
                    <button
                      type="button"
                      disabled={actioningId === booking.id}
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50 transition-colors disabled:opacity-50 dark:border-red-950/30 dark:bg-navy-900 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
