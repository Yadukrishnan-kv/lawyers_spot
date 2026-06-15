import Link from 'next/link';
import { AdminShell } from '@/components/admin/admin-shell';
import { ArticleEditForm } from '@/components/admin/article-edit-form';
import { getAdminCmsData } from '@/lib/cms/store';
import { makeDefaultItem } from '@/components/admin/list-section-utils';

export default async function NewArticlePage() {
  const cms = await getAdminCmsData();
  const article = makeDefaultItem('articles', cms) as import('@/lib/cms/types').Article;

  return (
    <AdminShell
      title="Add article"
      subtitle="Create a knowledge center article"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Articles', href: '/admin/articles' },
        { label: 'New' },
      ]}
    >
      <p className="mb-3">
        <Link href="/admin/articles" className="text-decoration-none fs-12">
          ← Back to articles
        </Link>
      </p>
      <ArticleEditForm initial={cms} article={article} isNew />
    </AdminShell>
  );
}
