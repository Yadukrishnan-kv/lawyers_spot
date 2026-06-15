import { LawyerQaReplyForm } from '@/components/lawyer/lawyer-qa-reply-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Reply to Question' };

type Props = { params: Promise<{ id: string }> };

export default async function LawyerQaReplyPage({ params }: Props) {
  const { id } = await params;
  return <LawyerQaReplyForm questionId={id} />;
}
