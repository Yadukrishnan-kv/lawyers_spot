import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { ArticleEditForm } from '@/components/admin/article-edit-form';
import { getAdminCmsData } from '@/lib/cms/store';

type Props = { params: Promise<{ slug: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const cms = await getAdminCmsData();
  const article = cms.articles.find((a) => a.slug === decoded);
  if (!article) notFound();

  return (
    <AdminShell
      title={`Edit — ${article.title}`}
      subtitle="Article content and metadata"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Articles', href: '/admin/articles' },
        { label: article.title },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/articles" className="text-decoration-none fs-12">
          ← Back to articles
        </Link>
      </p>
      <ArticleEditForm initial={cms} article={article} />
    </AdminShell>
  );
}
