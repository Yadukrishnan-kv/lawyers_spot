'use client';

import { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookingConfirmModal } from '@/components/lawyer/booking-confirm-modal';
import { createBooking } from '@/lib/user-auth';

const TIME_SLOTS = ['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'];
const CONSULT_TYPES = ['Video Call (30 min)', 'Phone Call (30 min)', 'In-Person (60 min)'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
  feeLabel: string;
  lawyerId: string;
  lawyerName: string;
  profilePath: string;
};

export function LawyerBookingWidget({ feeLabel, lawyerId, lawyerName, profilePath }: Props) {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = today.getDate();
    return d + 2 <= new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() ? d + 2 : d;
  });
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [type, setType] = useState(CONSULT_TYPES[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const monthLabel = today.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const calendarCells: ({ type: 'label'; text: string } | { type: 'day'; day: number; disabled: boolean })[] = [];
  WEEKDAYS.forEach((d) => calendarCells.push({ type: 'label', text: d }));
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push({ type: 'day', day: 0, disabled: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ type: 'day', day: d, disabled: d < today.getDate() });
  }

  const bookingDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  function openModal() {
    setError('');
    setModalOpen(true);
  }

  async function handleConfirmBooking({
    clientName,
    clientEmail,
  }: {
    clientName: string;
    clientEmail: string;
  }) {
    setError('');
    setLoading(true);
    try {
      await createBooking({
        lawyerId,
        lawyerName,
        clientName,
        clientEmail,
        date: bookingDate,
        time,
        type,
      });
      setModalOpen(false);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        setModalOpen(false);
        router.push(`/login?from=${encodeURIComponent(profilePath)}`);
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="booking-widget">
        <h3 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">Book Consultation</h3>
        <p className="mb-3 text-sm text-slate-500">Select a date and time for your confidential session</p>
        <p className="mb-2 font-bold text-navy-900 dark:text-white">{feeLabel} / session</p>

        <div className="mb-3">
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{monthLabel}</label>
          <div className="calendar-grid">
            {calendarCells.map((cell, i) => {
              if (cell.type === 'label') {
                return (
                  <div key={`l-${i}`} className="text-center text-xs font-bold text-slate-400">
                    {cell.text}
                  </div>
                );
              }
              if (cell.day === 0) {
                return <div key={`e-${i}`} className="calendar-day empty" />;
              }
              const isSelected = cell.day === selectedDay;
              return (
                <button
                  key={cell.day}
                  type="button"
                  disabled={cell.disabled}
                  className={`calendar-day ${cell.disabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => !cell.disabled && setSelectedDay(cell.day)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>

        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mb-3 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-navy-700 dark:bg-navy-900"
          aria-label="Time slot"
        >
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mb-3 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-navy-700 dark:bg-navy-900"
          aria-label="Consultation type"
        >
          {CONSULT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <Button
          className="w-full bg-royal-600 hover:bg-royal-500"
          size="lg"
          disabled={loading && modalOpen}
          onClick={openModal}
        >
          Confirm Booking
        </Button>
        <p className="mb-0 mt-3 text-center text-sm text-slate-500">
          <Lock className="mr-1 inline h-3.5 w-3.5" />
          Secure &amp; confidential · <a href="/login" className="text-royal-600">Sign in</a> to save bookings
        </p>
      </div>

      <BookingConfirmModal
        open={modalOpen}
        onClose={() => !loading && setModalOpen(false)}
        onConfirm={handleConfirmBooking}
        lawyerName={lawyerName}
        feeLabel={feeLabel}
        bookingDate={bookingDate}
        time={time}
        consultType={type}
        loading={loading}
        error={error}
      />
    </>
  );
}
