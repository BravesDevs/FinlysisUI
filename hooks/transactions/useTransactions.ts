import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import type { Transaction, TransactionsResponse, TransactionFilters } from '@/types/transaction';

export type { Transaction, TransactionsResponse, TransactionFilters };

export function useTransactions(filters: TransactionFilters) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { page = 1, limit = 50, bankAccountId, from, to, type } = filters;

  return useQuery({
    queryKey: ['transactions', { page, limit, bankAccountId, from, to, type }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit };
      if (bankAccountId) params.bankAccountId = bankAccountId;
      if (from)          params.from           = from;
      if (to)            params.to             = to;
      if (type)          params.type           = type;

      const res = await api.get<TransactionsResponse>('/transactions', { params });
      return res.data;
    },
    enabled: !!accessToken,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}
