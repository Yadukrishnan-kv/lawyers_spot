'use client';

import { useMemo, useState } from 'react';

export function useAdminPagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  function goTo(next: number) {
    setPage(Math.max(1, Math.min(totalPages, next)));
  }

  function resetPage() {
    setPage(1);
  }

  return {
    page: safePage,
    pageSize,
    totalPages,
    totalItems: items.length,
    pageItems,
    setPage: goTo,
    resetPage,
    from: items.length === 0 ? 0 : (safePage - 1) * pageSize + 1,
    to: Math.min(safePage * pageSize, items.length),
  };
}
