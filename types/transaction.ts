// Canonical transaction types for the frontend
// Source of truth: CLAUDE.md backend API reference

export type TransactionTypeCode = 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'FEE' | 'INTEREST' | 'REVERSAL';

export interface Transaction {
  id: string;
  bankAccountId: string;
  amount: number;                     // positive = credit, negative = debit
  fxRateToCAD: number | null;
  postedDate: string;
  valueDate: string | null;
  description: string;
  merchantName: string | null;
  merchantCategory: string | null;
  referenceNumber: string | null;
  balance: number | null;
  isRecurring: boolean;
  isDuplicate: boolean;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  transactionType: { code: TransactionTypeCode; label: string };
  category: { name: string } | null;
  currency: { code: string; symbol: string };
  bankAccount: { accountNumberMasked: string | null; nickname: string | null };
}

export interface TransactionMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface TransactionsResponse {
  data: Transaction[];
  meta: TransactionMeta;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  bankAccountId?: string | null;
  from?: string;
  to?: string;
  type?: 'CREDIT' | 'DEBIT' | null;
}
