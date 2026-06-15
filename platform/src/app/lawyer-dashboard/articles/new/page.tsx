import { LawyerArticleForm } from '@/components/lawyer/lawyer-article-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Write Article' };

export default function LawyerNewArticlePage() {
  return <LawyerArticleForm />;
}
