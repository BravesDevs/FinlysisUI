import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboard.store';
import { api } from '@/lib/api';
import type { CashFlowPeriod } from '@/lib/types';

export function useCashFlow() {
  const { bankAccountId, from, to, granularity } = useDashboardStore();

  return useQuery({
    queryKey: ['dashboard', 'cash-flow', { bankAccountId, from, to, granularity }],
    queryFn: async () => {
      const params = {
        from, to, granularity,
        ...(bankAccountId && { bankAccountId }),
      };
      const res = await api.get<CashFlowPeriod[]>('/dashboard/cash-flow', { params });
      return res.data;
    },
  });
}
