'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { useAdminPagination } from '@/hooks/use-admin-pagination';

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  rows: T[];
  columns: AdminTableColumn<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  emptyMessage?: string;
  onEdit?: (row: T) => void;
  editHref?: (row: T) => string;
  onDelete?: (row: T) => void;
  showActions?: boolean;
  /** Custom action cell (replaces default edit/delete) */
  renderActions?: (row: T) => React.ReactNode;
};

export function AdminDataTable<T>({
  rows,
  columns,
  rowKey,
  pageSize = 10,
  emptyMessage = 'No records found.',
  onEdit,
  editHref,
  onDelete,
  showActions = true,
  renderActions,
}: Props<T>) {
  const { pageItems, page, totalPages, totalItems, from, to, setPage } = useAdminPagination(
    rows,
    pageSize,
  );

  const hasActions = showActions && (renderActions || onEdit || editHref || onDelete);

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-bordered text-nowrap border-bottom mb-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.className}>
                  {col.header}
                </th>
              ))}
              {hasActions && <th className="text-end">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center text-muted py-4">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageItems.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render(row)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="text-end text-nowrap">
                      {renderActions ? (
                        renderActions(row)
                      ) : (
                        <>
                          {(editHref || onEdit) &&
                            (editHref ? (
                              <Link
                                href={editHref(row)}
                                className="btn btn-sm btn-outline-primary me-1"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary me-1"
                                title="Edit"
                                onClick={() => onEdit?.(row)}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            ))}
                          {onDelete && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Delete"
                              onClick={() => onDelete(row)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalItems > pageSize && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
          <p className="text-muted fs-12 mb-0">
            Showing {from}–{to} of {totalItems}
          </p>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPage(page - 1)}>
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                  <span key={p} className="d-flex">
                    {showEllipsis && (
                      <li className="page-item disabled">
                        <span className="page-link">…</span>
                      </li>
                    )}
                    <li className={`page-item ${p === page ? 'active' : ''}`}>
                      <button type="button" className="page-link" onClick={() => setPage(p)}>
                        {p}
                      </button>
                    </li>
                  </span>
                );
              })}
            <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPage(page + 1)}>
                Next
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
