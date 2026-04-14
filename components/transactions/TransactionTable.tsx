'use client';

import { format, parseISO } from 'date-fns';
import { ReceiptText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Transaction } from '@/types/transaction';
import { useQueryClient } from '@tanstack/react-query';
import type { TransactionFilters } from '@/types/transaction';

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatAmount(amount: number, currencyCode: string, type: string): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(abs);
  return type === 'DEBIT' ? `−${formatted}` : formatted;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ---------------------------------------------------------------------------
// Type badge
// ---------------------------------------------------------------------------

function TypeBadge({ code }: { code: string }) {
  const styles =
    code === 'CREDIT'
      ? 'bg-[#dcfce7] text-[#166534] border border-[#86efac]'
      : 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]';

  return (
    <span
      className={`inline-flex items-center rounded-[99px] px-[10px] py-[2px] text-[11px] font-medium font-sans ${styles}`}
      style={{ fontStyle: 'normal' }}
    >
      {code === 'CREDIT' ? 'Credit' : 'Debit'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

const SKELETON_WIDTHS = [
  ['w-24', 'w-40', 'w-28', 'w-16', 'w-20'],
  ['w-20', 'w-56', 'w-32', 'w-16', 'w-16'],
  ['w-24', 'w-48', 'w-24', 'w-16', 'w-24'],
  ['w-20', 'w-36', 'w-28', 'w-16', 'w-20'],
  ['w-24', 'w-44', 'w-20', 'w-16', 'w-18'],
  ['w-20', 'w-52', 'w-32', 'w-16', 'w-20'],
  ['w-24', 'w-40', 'w-24', 'w-16', 'w-22'],
  ['w-20', 'w-36', 'w-28', 'w-16', 'w-20'],
  ['w-24', 'w-48', 'w-20', 'w-16', 'w-24'],
  ['w-20', 'w-44', 'w-32', 'w-16', 'w-18'],
];

function SkeletonRow({ widths }: { widths: string[] }) {
  return (
    <TableRow className="border-b border-[color:var(--border)]">
      {widths.map((w, i) => (
        <TableCell key={i} className="py-3.5">
          <div className={`h-3.5 rounded-full bg-[var(--muted)] animate-pulse ${w}`} />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={5}>
        <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 py-12">
          <ReceiptText className="size-8 text-[var(--text-muted)]" strokeWidth={1.5} />
          <p
            className="text-[16px] font-medium font-sans text-[var(--text-primary)]"
            style={{ fontStyle: 'normal' }}
          >
            No transactions found
          </p>
          <p
            className="text-[14px] font-sans text-[var(--text-muted)] text-center max-w-xs"
            style={{ fontStyle: 'normal' }}
          >
            Try adjusting your filters or connecting a bank account.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <TableRow>
      <TableCell colSpan={5}>
        <div className="flex flex-col items-center justify-center min-h-[320px] gap-4 py-12">
          <p
            className="text-[14px] font-sans text-[#991b1b]"
            style={{ fontStyle: 'normal' }}
          >
            Unable to load transactions. Please try again.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2 rounded-[10px] bg-gradient-to-br from-[#3ab4e8] to-[#1a6fa3] text-white text-[13px] font-medium font-sans hover:brightness-110 active:scale-[0.98] transition-all"
            style={{ fontStyle: 'normal' }}
          >
            Retry
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Transaction row
// ---------------------------------------------------------------------------

function TxRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.transactionType.code === 'CREDIT';
  const rowBg    = isCredit ? 'bg-[#f0fdf4] hover:bg-[#dcfce7]' : 'bg-[#fff7f7] hover:bg-[#fee2e2]';
  const amtColor = isCredit ? 'text-[#166534]' : 'text-[#991b1b]';

  const displayName = tx.merchantName
    ? truncate(tx.merchantName, 40)
    : truncate(tx.description, 40);

  return (
    <TableRow
      className={`${rowBg} border-b border-[color:var(--border)] transition-colors duration-[120ms]`}
    >
      {/* Date */}
      <TableCell
        className="py-3.5 text-[14px] font-sans text-[var(--text-secondary)] whitespace-nowrap"
        style={{ fontStyle: 'normal' }}
      >
        {format(parseISO(tx.postedDate), 'MMM dd, yyyy')}
      </TableCell>

      {/* Description */}
      <TableCell className="py-3.5 max-w-[280px]">
        <p
          className="text-[14px] font-sans text-[var(--text-primary)] truncate"
          style={{ fontStyle: 'normal' }}
        >
          {displayName}
        </p>
        {tx.category && (
          <p
            className="text-[12px] font-sans text-[var(--text-muted)] mt-0.5"
            style={{ fontStyle: 'normal' }}
          >
            {tx.category.name}
          </p>
        )}
      </TableCell>

      {/* Account */}
      <TableCell
        className="py-3.5 text-[13px] font-sans text-[var(--text-muted)] whitespace-nowrap"
        style={{ fontStyle: 'normal' }}
      >
        {tx.bankAccount.nickname ?? tx.bankAccount.accountNumberMasked ?? '—'}
      </TableCell>

      {/* Type badge */}
      <TableCell className="py-3.5">
        <TypeBadge code={tx.transactionType.code} />
      </TableCell>

      {/* Amount */}
      <TableCell className="py-3.5 text-right">
        <span
          className={`text-[14px] font-semibold font-sans tabular-nums ${amtColor}`}
          style={{ fontStyle: 'normal', fontFamily: 'var(--font-inter), ui-monospace, "SF Mono", Menlo, monospace' }}
        >
          {formatAmount(tx.amount, tx.currency.code, tx.transactionType.code)}
        </span>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// TransactionTable
// ---------------------------------------------------------------------------

interface Props {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  filters: TransactionFilters;
}

export function TransactionTable({ transactions, isLoading, isError, isFetching, filters }: Props) {
  const queryClient = useQueryClient();

  function retry() {
    queryClient.invalidateQueries({
      queryKey: ['transactions', {
        page: filters.page ?? 1,
        limit: filters.limit ?? 50,
        bankAccountId: filters.bankAccountId,
        from: filters.from,
        to: filters.to,
        type: filters.type,
      }],
    });
  }

  return (
    <div className={`relative transition-opacity duration-150 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
      <Table>
        {/* Sticky header */}
        <TableHeader>
          <TableRow className="bg-[var(--bg-page)] border-b-2 border-[color:var(--border-strong)]">
            {(['Date', 'Description', 'Account', 'Type', 'Amount'] as const).map((col) => (
              <TableHead
                key={col}
                className={[
                  'py-3 text-[12px] font-semibold font-sans uppercase tracking-[0.06em] text-[var(--text-muted)]',
                  col === 'Amount' ? 'text-right' : '',
                ].join(' ')}
                style={{ fontStyle: 'normal', position: 'sticky', top: 0, zIndex: 10 }}
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            SKELETON_WIDTHS.map((widths, i) => <SkeletonRow key={i} widths={widths} />)
          ) : isError ? (
            <ErrorState onRetry={retry} />
          ) : !transactions?.length ? (
            <EmptyState />
          ) : (
            transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
