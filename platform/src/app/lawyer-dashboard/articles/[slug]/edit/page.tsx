import { LawyerArticleForm } from '@/components/lawyer/lawyer-article-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Article' };

type Props = { params: Promise<{ slug: string }> };

export default async function LawyerEditArticlePage({ params }: Props) {
  const { slug } = await params;
  return <LawyerArticleForm slug={slug} />;
}
