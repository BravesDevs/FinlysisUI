import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboard.store';
import { api } from '@/lib/api';
import type { BalancePoint } from '@/lib/types';

export function useCumulativeBalance() {
  const { bankAccountId, from, to, granularity } = useDashboardStore();

  return useQuery({
    queryKey: ['dashboard', 'cumulative-balance', { bankAccountId, from, to, granularity }],
    queryFn: async () => {
      const params = {
        from, to, granularity,
        ...(bankAccountId && { bankAccountId }),
      };
      const res = await api.get<BalancePoint[]>('/dashboard/cumulative-balance', { params });
      return res.data;
    },
  });
}
