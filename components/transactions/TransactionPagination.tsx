'use client';

import type { TransactionMeta } from '@/types/transaction';

// ---------------------------------------------------------------------------
// Page number list with ellipsis
// ---------------------------------------------------------------------------

function buildPageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [];

  // Always show first, last, current, and two neighbours
  const show = new Set([1, total, current, current - 1, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = Array.from(show).sort((a, b) => a - b);

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && (sorted[i] as number) - (sorted[i - 1] as number) > 1) pages.push('…');
    pages.push(sorted[i]);
  }

  return pages;
}

// ---------------------------------------------------------------------------
// TransactionPagination
// ---------------------------------------------------------------------------

interface Props {
  meta: TransactionMeta | undefined;
  page: number;
  onPageChange: (p: number) => void;
  tableRef: React.RefObject<HTMLDivElement | null>;
}

export function TransactionPagination({ meta, page, onPageChange, tableRef }: Props) {
  if (!meta || meta.total === 0) return null;

  const { total, limit, totalPages } = meta;
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  function goTo(p: number) {
    if (p < 1 || p > totalPages) return;
    onPageChange(p);
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const pageList = buildPageList(page, totalPages);

  return (
    <div
      className="flex items-center justify-between py-4"
      style={{ fontStyle: 'normal' }}
    >
      {/* Left: record count */}
      <p
        className="text-[13px] font-sans text-[var(--text-muted)]"
        style={{ fontStyle: 'normal' }}
      >
        Showing <span className="font-medium text-[var(--text-secondary)]">{start}–{end}</span> of{' '}
        <span className="font-medium text-[var(--text-secondary)]">{total}</span> transactions
      </p>

      {/* Right: page controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium font-sans text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ fontStyle: 'normal' }}
        >
          ← Prev
        </button>

        {/* Page numbers */}
        {pageList.map((item, i) =>
          item === '…' ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-1.5 text-[13px] font-sans text-[var(--text-muted)]"
              style={{ fontStyle: 'normal' }}
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => goTo(item as number)}
              className={[
                'min-w-[32px] px-2 py-1.5 rounded-[8px] text-[13px] font-medium font-sans transition-colors',
                item === page
                  ? 'bg-[var(--color-azure)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]',
              ].join(' ')}
              style={{ fontStyle: 'normal' }}
            >
              {item}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium font-sans text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ fontStyle: 'normal' }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
