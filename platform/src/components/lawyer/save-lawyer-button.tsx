'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchSavedLawyerIds, saveLawyer, removeSavedLawyer } from '@/lib/user-auth';
import { cn } from '@/lib/utils';

type Props = {
  lawyerId: string;
  className?: string;
};

export function SaveLawyerButton({ lawyerId, className }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSavedLawyerIds().then((data) => {
      setSaved(data.ids.includes(lawyerId));
    }).catch(() => {});
  }, [lawyerId]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      if (saved) {
        await removeSavedLawyer(lawyerId);
        setSaved(false);
      } else {
        await saveLawyer(lawyerId);
        setSaved(true);
      }
    } catch {
      router.push('/login?from=' + encodeURIComponent(window.location.pathname));
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'flex items-center justify-center rounded-full p-2 transition',
        saved
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white/80 text-slate-400 hover:bg-white hover:text-red-500',
        loading && 'opacity-50',
        className,
      )}
      aria-label={saved ? 'Remove from saved' : 'Save lawyer'}
    >
      <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
    </button>
  );
}
