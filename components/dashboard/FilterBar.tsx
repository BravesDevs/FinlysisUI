'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardStore } from '@/store/dashboard.store';
import { useAccountBalances } from '@/hooks/dashboard/useAccountBalances';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Granularity toggle
// ---------------------------------------------------------------------------

function GranularityToggle() {
  const { granularity, setFilter } = useDashboardStore();

  return (
    <div className="flex rounded-[10px] overflow-hidden border border-[color:var(--border)] bg-[var(--muted)]">
      {(['monthly', 'weekly'] as const).map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => setFilter({ granularity: g })}
          className={cn(
            'px-4 py-2 text-[13px] font-medium font-sans transition-colors',
            granularity === g
              ? 'bg-[var(--bg-card)] text-[var(--color-deep)] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(58,180,232,0.20)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
          )}
        >
          {g === 'monthly' ? 'Monthly' : 'Weekly'}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilterBar
// ---------------------------------------------------------------------------

export function FilterBar() {
  const { bankAccountId, from, to, setFilter } = useDashboardStore();
  const { data: accountsData, isLoading: accountsLoading } = useAccountBalances();

  return (
    <div className="flex items-center gap-4 px-8 py-3 bg-[var(--bg-card)] border-b border-[color:var(--border)]">
      {/* Account selector */}
      <div className="flex items-center gap-2">
        <span className="type-ui-label text-[var(--text-muted)] whitespace-nowrap">Account</span>
        <Select
          value={bankAccountId ?? 'all'}
          onValueChange={(v) => setFilter({ bankAccountId: v === 'all' ? null : v })}
          disabled={accountsLoading}
        >
          <SelectTrigger className="h-auto py-2 px-3 w-52 rounded-[10px] border-[color:var(--border)] text-[13px] font-sans bg-[var(--bg-card)]">
            <SelectValue placeholder="All accounts" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px] border-[color:var(--border)]">
            <SelectItem value="all" className="text-[13px] font-sans">
              All accounts
            </SelectItem>
            {accountsData?.accounts.map((a) => (
              <SelectItem key={a.id} value={a.id} className="text-[13px] font-sans">
                {a.nickname ?? a.accountNumberMasked ?? a.accountType.label}
                <span className="ml-2 text-[var(--text-muted)]">{a.currency.code}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-[color:var(--border)]" />

      {/* Date range */}
      <div className="flex items-center gap-2">
        <span className="type-ui-label text-[var(--text-muted)]">From</span>
        <input
          type="date"
          value={from}
          onChange={(e) => setFilter({ from: e.target.value })}
          className="h-auto py-2 px-3 rounded-[10px] border border-[color:var(--border)] bg-[var(--bg-card)] text-[13px] font-sans text-[var(--text-primary)] focus:outline-none focus:border-[color:var(--color-azure)] focus:shadow-[0_0_0_3px_rgba(58,180,232,0.20)]"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="type-ui-label text-[var(--text-muted)]">To</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setFilter({ to: e.target.value })}
          className="h-auto py-2 px-3 rounded-[10px] border border-[color:var(--border)] bg-[var(--bg-card)] text-[13px] font-sans text-[var(--text-primary)] focus:outline-none focus:border-[color:var(--color-azure)] focus:shadow-[0_0_0_3px_rgba(58,180,232,0.20)]"
        />
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-[color:var(--border)]" />

      {/* Granularity toggle */}
      <GranularityToggle />
    </div>
  );
}
