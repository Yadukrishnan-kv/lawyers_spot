import { cn } from '@/lib/utils';

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'success' | 'gold' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variant === 'default' && 'bg-royal-500/10 text-royal-600',
        variant === 'success' && 'bg-emerald-500/10 text-emerald-700',
        variant === 'gold' && 'bg-gold-500/15 text-amber-800',
        className
      )}
      {...props}
    />
  );
}
