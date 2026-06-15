'use client';

import { useState } from 'react';
import { maskPhone } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Props = {
  phone: string;
  className?: string;
};

export function ViewContactNumber({ phone, className }: Props) {
  const [revealed, setRevealed] = useState(false);
  const digits = phone.replace(/\D/g, '');
  const masked = maskPhone(phone);
  const fullDisplay =
    digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : phone;

  const label = revealed
    ? fullDisplay
    : `VIEW CONTACT NUMBER - ${masked}`;

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className={cn(
        'w-full rounded-md bg-royal-600 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-400 focus:ring-offset-2 focus:ring-offset-navy-800',
        revealed && 'cursor-default hover:bg-royal-600',
        className
      )}
      aria-label={revealed ? `Contact number ${fullDisplay}` : 'View contact number'}
    >
      {label}
    </button>
  );
}
