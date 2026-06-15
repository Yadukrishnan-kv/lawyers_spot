'use client';

import { TableListManager } from '@/components/admin/table-list-manager';
import type { Article, CmsData } from '@/lib/cms/types';

export function ArticlesManager({ initial }: { initial: CmsData }) {
  return (
    <TableListManager<Article>
      initial={initial}
      section="articles"
      title="Articles"
      idKey="slug"
      editMode="page"
      editPath={(a) => `/admin/articles/${encodeURIComponent(a.slug)}/edit`}
      newPath="/admin/articles/new"
      columns={[
        { key: 'title', header: 'Title', render: (a) => <span className="fw-semibold">{a.title}</span> },
        { key: 'category', header: 'Category', render: (a) => a.category },
        { key: 'author', header: 'Author', render: (a) => a.author },
        { key: 'slug', header: 'Slug', render: (a) => <code className="fs-12">{a.slug}</code> },
      ]}
      fields={[]}
    />
  );
}
