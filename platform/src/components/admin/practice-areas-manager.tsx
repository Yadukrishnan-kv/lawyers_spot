'use client';

import { TableListManager } from '@/components/admin/table-list-manager';
import type { CmsData, PracticeArea } from '@/lib/cms/types';

export function PracticeAreasManager({ initial }: { initial: CmsData }) {
  return (
    <TableListManager<PracticeArea>
      initial={initial}
      section="practiceAreas"
      title="Practice areas"
      idKey="slug"
      editMode="modal"
      columns={[
        { key: 'name', header: 'Name', render: (p) => <span className="fw-semibold">{p.name}</span> },
        { key: 'slug', header: 'Slug', render: (p) => <code className="fs-12">{p.slug}</code> },
        { key: 'icon', header: 'Icon', render: (p) => p.icon },
        { key: 'lawyers', header: 'Lawyers', render: (p) => String(p.lawyers) },
      ]}
      fields={[
        { key: 'slug', label: 'Slug' },
        { key: 'name', label: 'Name' },
        { key: 'icon', label: 'Icon name' },
        { key: 'lawyers', label: 'Lawyer count', type: 'number' },
      ]}
    />
  );
}
