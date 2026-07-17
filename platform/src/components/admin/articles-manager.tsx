'use client';

import { useState, useCallback } from 'react';
import { TableListManager } from '@/components/admin/table-list-manager';
import { LawyerAssignmentPicker } from '@/components/admin/lawyer-assignment-picker';
import { sortByCreatedDesc } from '@/lib/admin/sort-utils';
import type { Article, CmsData } from '@/lib/cms/types';

export function ArticlesManager({ initial }: { initial: CmsData }) {
  const [articles, setArticles] = useState<Article[]>(sortByCreatedDesc(initial.articles));

  const allLawyers = initial.lawyers.map((l) => ({
    id: l.id as string,
    name: l.name as string,
    practice: l.practice as string | undefined,
  }));

  const handleAssignmentChange = useCallback((slug: string, lawyerIds: string[]) => {
    setArticles((prev) =>
      prev.map((a) => (a.slug === slug ? { ...a, assignedLawyerIds: lawyerIds } : a)),
    );
  }, []);

  const updatedInitial = { ...initial, articles };

  return (
    <TableListManager<Article>
      initial={updatedInitial}
      section="articles"
      title="Articles"
      idKey="slug"
      editMode="page"
      editPath={(a) => `/admin/articles/${encodeURIComponent(a.slug)}/edit`}
      newPath="/admin/articles/new"
      columns={[
        { key: 'title', header: 'Title', render: (a) => <span className="fw-semibold">{a.title}</span> },
        { key: 'category', header: 'Category', render: (a) => a.category },
        { key: 'lawyers', header: 'Lawyers', className: 'min-w-200', render: (a) => (
          <LawyerAssignmentPicker
            articleSlug={a.slug}
            allLawyers={allLawyers}
            initialSelected={a.assignedLawyerIds ?? []}
            onChange={(ids) => handleAssignmentChange(a.slug, ids)}
          />
        )},
        { key: 'author', header: 'Author', render: (a) => a.author },
        { key: 'slug', header: 'Slug', render: (a) => <code className="fs-12">{a.slug}</code> },
      ]}
      fields={[]}
    />
  );
}
