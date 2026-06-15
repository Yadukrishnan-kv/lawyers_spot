'use client';

import { TableListManager } from '@/components/admin/table-list-manager';
import type { CmsData, QaPost } from '@/lib/cms/types';

export function QaManager({ initial }: { initial: CmsData }) {
  return (
    <TableListManager<QaPost>
      initial={initial}
      section="qaPosts"
      title="Q&A posts"
      idKey="id"
      editMode="page"
      editPath={(q) => `/admin/qa/${encodeURIComponent(q.id)}/edit`}
      newPath="/admin/qa/new"
      columns={[
        { key: 'title', header: 'Title', render: (q) => <span className="fw-semibold">{q.title}</span> },
        { key: 'category', header: 'Category', render: (q) => q.category },
        { key: 'answers', header: 'Answers', render: (q) => String(q.answers) },
        { key: 'views', header: 'Views', render: (q) => String(q.views) },
      ]}
      fields={[]}
    />
  );
}
