import { Mail, Phone, CheckCircle2, XCircle } from 'lucide-react';
import type { Lawyer } from '@/lib/data-types';
import { cn } from '@/lib/utils';

type Props = {
  lawyer: Pick<Lawyer, 'emailVerified' | 'phoneVerified' | 'phone' | 'email'>;
  size?: 'sm' | 'md';
  layout?: 'inline' | 'stack';
  className?: string;
};

export function VerificationBadges({
  lawyer,
  size = 'sm',
  layout = 'inline',
  className,
}: Props) {
  const text = size === 'sm' ? 'text-xs' : 'text-sm';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const wrap = layout === 'stack' ? 'flex flex-col gap-1.5' : 'flex flex-wrap gap-2';

  const items = [
    {
      key: 'email',
      label: 'Email',
      value: lawyer.email,
      verified: Boolean(lawyer.emailVerified),
      Icon: Mail,
    },
    {
      key: 'phone',
      label: 'Mobile',
      value: lawyer.phone,
      verified: Boolean(lawyer.phoneVerified),
      Icon: Phone,
    },
  ];

  return (
    <div className={cn(wrap, className)}>
      {items.map(({ key, label, value, verified, Icon }) => (
        <span
          key={key}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
            text,
            verified
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400',
          )}
          title={value ? `${label}: ${value}` : `${label} not provided`}
        >
          <Icon className={icon} aria-hidden="true" />
          {label}
          {verified ? (
            <CheckCircle2 className={icon} aria-label="Verified" />
          ) : (
            <XCircle className={cn(icon, 'opacity-60')} aria-label="Not verified" />
          )}
        </span>
      ))}
    </div>
  );
}
