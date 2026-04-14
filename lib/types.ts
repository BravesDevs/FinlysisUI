// ---------------------------------------------------------------------------
// Shared API response types (sourced from CLAUDE.md backend reference)
// ---------------------------------------------------------------------------

export type AccountTypeCode =
  | 'CHEQUING' | 'SAVINGS' | 'TFSA' | 'RRSP' | 'FHSA' | 'LOC' | 'CREDIT_CARD';

export interface AccountBalance {
  id: string;
  nickname: string | null;
  accountNumberMasked: string | null;
  accountType: { code: AccountTypeCode; label: string };
  bank: { name: string | null };
  currentBalance: number;
  availableBalance: number | null;
  balanceAsOf: string;
  currency: { code: string; symbol: string };
  isActive: boolean;
}

export interface AccountBalancesResponse {
  accounts: AccountBalance[];
  totals: {
    totalCurrentBalanceCAD: number;
    totalAvailableBalanceCAD: number;
  };
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface CashFlowPeriod {
  period: string;
  totalInflow: number;
  totalOutflow: number; // negative number
  netFlow: number;
}

export interface BalancePoint {
  date: string;
  balance: number;
}

export interface CategorySlice {
  label: string;
  total: number;
  percentage: number;
}

export interface MerchantSlice {
  merchantName: string;
  total: number;
  transactionCount: number;
}

export interface RecurringVsOneOff {
  recurring: { total: number; count: number; percentage: number };
  oneOff:    { total: number; count: number; percentage: number };
}

export interface BurnRate {
  currentMonthSpend: number;
  avgPrevThreeMonths: number;
  burnRateRatio: number | null;
  trend: 'OVER' | 'UNDER' | 'ON_TRACK';
}

export interface CurrencyExposure {
  currencyCode: string;
  symbol: string;
  totalCAD: number;
  percentage: number;
}

export interface TagSummary {
  tag: string;
  totalSpend: number;
  transactionCount: number;
}

// ── Common dashboard query params ───────────────────────────────────────────

export interface DashboardParams {
  bankAccountId?: string;
  from?: string;
  to?: string;
  granularity?: 'weekly' | 'monthly';
}
