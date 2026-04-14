'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAccountBalances } from '@/hooks/dashboard/useAccountBalances';
import type { TransactionFilters } from '@/types/transaction';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const DEFAULT_FILTERS: TransactionFilters = {
  page: 1,
  limit: 50,
  bankAccountId: null,
  from: defaultFrom(),
  to: todayISO(),
  type: null,
};

// ---------------------------------------------------------------------------
// Type toggle pill
// ---------------------------------------------------------------------------

function TypePill({
  label,
  value,
  active,
  activeClass,
  onClick,
}: {
  label: string;
  value: 'CREDIT' | 'DEBIT' | null;
  active: boolean;
  activeClass: string;
  onClick: (v: 'CREDIT' | 'DEBIT' | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={[
        'px-3 py-1.5 rounded-[99px] text-[11px] font-medium font-sans border transition-colors',
        active
          ? activeClass
          : 'bg-transparent text-[var(--text-muted)] border-[color:var(--border)] hover:border-[color:var(--color-azure)] hover:text-[var(--color-deep)]',
      ].join(' ')}
      style={{ fontStyle: 'normal' }}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// FilterBar
// ---------------------------------------------------------------------------

interface Props {
  filters: TransactionFilters;
  onChange: (next: Partial<TransactionFilters>) => void;
  onReset: () => void;
}

export function TransactionFilterBar({ filters, onChange, onReset }: Props) {
  const { data: accountsData, isLoading: accountsLoading } = useAccountBalances();

  function setFrom(value: string) {
    // Clamp: from must not be after to
    if (filters.to && value > filters.to) return;
    onChange({ from: value, page: 1 });
  }

  function setTo(value: string) {
    if (filters.from && value < filters.from) return;
    onChange({ to: value, page: 1 });
  }

  const activeType = filters.type ?? null;

  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-2 px-8 py-3 bg-[var(--bg-card)] border-b border-[color:var(--border)]"
      style={{ fontStyle: 'normal' }}
    >
      {/* Account */}
      <div className="flex items-center gap-2">
        <span
          className="text-[13px] font-medium font-sans text-[var(--text-muted)] whitespace-nowrap"
          style={{ fontStyle: 'normal' }}
        >
          Account
        </span>
        <Select
          value={filters.bankAccountId ?? 'all'}
          onValueChange={(v) => onChange({ bankAccountId: v === 'all' ? null : v, page: 1 })}
          disabled={accountsLoading}
        >
          <SelectTrigger
            className="h-auto py-2 px-3 w-52 rounded-[10px] border-[color:var(--border)] text-[13px] font-sans bg-[var(--bg-card)]"
            style={{ fontStyle: 'normal' }}
          >
            <SelectValue placeholder="All accounts" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px] border-[color:var(--border)]">
            <SelectItem value="all" className="text-[13px] font-sans" style={{ fontStyle: 'normal' }}>
              All accounts
            </SelectItem>
            {accountsData?.accounts.map((a) => {
              const last4 = a.accountNumberMasked?.slice(-4) ?? '';
              const label = [a.bank.name, last4 ? `••${last4}` : null].filter(Boolean).join(' ');
              return (
                <SelectItem
                  key={a.id}
                  value={a.id}
                  className="text-[13px] font-sans"
                  style={{ fontStyle: 'normal' }}
                >
                  {label || a.nickname || a.accountType.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-[color:var(--border)]" />

      {/* Date range */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium font-sans text-[var(--text-muted)]" style={{ fontStyle: 'normal' }}>
          From
        </span>
        <input
          type="date"
          value={filters.from ?? ''}
          onChange={(e) => setFrom(e.target.value)}
          className="h-auto py-2 px-3 rounded-[10px] border border-[color:var(--border)] bg-[var(--bg-card)] text-[13px] font-sans text-[var(--text-primary)] focus:outline-none focus:border-[color:var(--color-azure)] focus:shadow-[0_0_0_3px_rgba(58,180,232,0.20)]"
          style={{ fontStyle: 'normal' }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium font-sans text-[var(--text-muted)]" style={{ fontStyle: 'normal' }}>
          To
        </span>
        <input
          type="date"
          value={filters.to ?? ''}
          onChange={(e) => setTo(e.target.value)}
          className="h-auto py-2 px-3 rounded-[10px] border border-[color:var(--border)] bg-[var(--bg-card)] text-[13px] font-sans text-[var(--text-primary)] focus:outline-none focus:border-[color:var(--color-azure)] focus:shadow-[0_0_0_3px_rgba(58,180,232,0.20)]"
          style={{ fontStyle: 'normal' }}
        />
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-[color:var(--border)]" />

      {/* Type toggle */}
      <div className="flex items-center gap-1.5">
        <TypePill
          label="All"
          value={null}
          active={activeType === null}
          activeClass="bg-[var(--color-azure)] text-white border-[color:var(--color-azure)]"
          onClick={(v) => onChange({ type: v, page: 1 })}
        />
        <TypePill
          label="Credit"
          value="CREDIT"
          active={activeType === 'CREDIT'}
          activeClass="bg-[#dcfce7] text-[#166534] border border-[#86efac]"
          onClick={(v) => onChange({ type: v, page: 1 })}
        />
        <TypePill
          label="Debit"
          value="DEBIT"
          active={activeType === 'DEBIT'}
          activeClass="bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]"
          onClick={(v) => onChange({ type: v, page: 1 })}
        />
      </div>

      {/* Spacer + Reset */}
      <div className="ml-auto">
        <button
          type="button"
          onClick={onReset}
          className="text-[13px] font-medium font-sans text-[var(--color-azure)] hover:text-[var(--color-deep)] transition-colors"
          style={{ fontStyle: 'normal' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
