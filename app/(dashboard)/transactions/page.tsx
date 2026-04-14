'use client';

import { useRef, useState, useCallback } from 'react';
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { TransactionFilterBar, DEFAULT_FILTERS } from '@/components/transactions/TransactionFilterBar';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionPagination } from '@/components/transactions/TransactionPagination';
import type { TransactionFilters } from '@/types/transaction';

// ---------------------------------------------------------------------------
// Summary strip
// ---------------------------------------------------------------------------

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 });

function SummaryStrip({
  total,
  pageCredits,
  pageDebits,
}: {
  total: number;
  pageCredits: number;
  pageDebits: number;
}) {
  return (
    <div
      className="flex items-center gap-0 px-8 py-2.5 bg-[var(--bg-page)] border-b border-[color:var(--border)]"
      style={{ fontStyle: 'normal' }}
    >
      <span className="text-[13px] font-sans text-[var(--text-muted)]" style={{ fontStyle: 'normal' }}>
        Total results:{' '}
        <span className="font-medium text-[var(--text-secondary)]">{total.toLocaleString()}</span>
      </span>

      <div className="mx-4 h-4 w-px bg-[color:var(--border)]" />

      <span className="text-[13px] font-sans text-[var(--text-muted)]" style={{ fontStyle: 'normal' }}>
        This page credits:{' '}
        <span className="font-medium text-[#166534]">{CAD.format(pageCredits)}</span>
      </span>

      <div className="mx-4 h-4 w-px bg-[color:var(--border)]" />

      <span className="text-[13px] font-sans text-[var(--text-muted)]" style={{ fontStyle: 'normal' }}>
        This page debits:{' '}
        <span className="font-medium text-[#991b1b]">{CAD.format(pageDebits)}</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, isFetching } = useTransactions(filters);

  const handleFilterChange = useCallback((partial: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: partial.page ?? 1 }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setFilters((prev) => ({ ...prev, page: p }));
  }, []);

  // Compute page-level credit / debit sums
  const transactions = data?.data ?? [];
  let pageCredits = 0;
  let pageDebits  = 0;
  for (const tx of transactions) {
    if (tx.transactionType.code === 'CREDIT') pageCredits += Math.abs(tx.amount);
    else                                       pageDebits  += Math.abs(tx.amount);
  }

  return (
    <div className="flex flex-col min-h-full bg-[var(--bg-page)]" style={{ fontStyle: 'normal' }}>
      {/* Page header */}
      <header className="grad-hero border-b border-[color:var(--border)] px-8 py-5">
        <h1
          className="font-heading font-bold text-[32px] tracking-[-0.02em] leading-tight text-[var(--color-ink)]"
          style={{ fontStyle: 'normal' }}
        >
          Transactions
        </h1>
        <p
          className="text-[14px] font-sans text-[var(--text-muted)] mt-0.5"
          style={{ fontStyle: 'normal' }}
        >
          All activity across your connected accounts
        </p>
      </header>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20">
        <TransactionFilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      {/* Summary strip */}
      <SummaryStrip
        total={data?.meta.total ?? 0}
        pageCredits={pageCredits}
        pageDebits={pageDebits}
      />

      {/* Table */}
      <div ref={tableRef} className="flex-1 px-8 pt-4">
        <TransactionTable
          transactions={transactions}
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          filters={filters}
        />
      </div>

      {/* Pagination */}
      <div className="px-8 pb-12">
        <TransactionPagination
          meta={data?.meta}
          page={filters.page ?? 1}
          onPageChange={handlePageChange}
          tableRef={tableRef}
        />
      </div>
    </div>
  );
}
