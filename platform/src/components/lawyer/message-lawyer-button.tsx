'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { startConversation } from '@/lib/user-auth';
import { Button } from '@/components/ui/button';

type Props = {
  lawyerId: string;
  lawyerName: string;
  className?: string;
};

export function MessageLawyerButton({ lawyerId, lawyerName, className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await startConversation(lawyerId);
      router.push(`/dashboard/messages`);
    } catch {
      router.push('/login?from=' + encodeURIComponent(window.location.pathname));
    }
    setLoading(false);
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      variant="secondary"
      className={className}
    >
      <MessageSquare className="h-4 w-4" />
      {loading ? 'Opening...' : 'Message Lawyer'}
    </Button>
  );
}
