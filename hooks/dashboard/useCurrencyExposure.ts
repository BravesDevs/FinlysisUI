import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboard.store';
import { api } from '@/lib/api';
import type { CurrencyExposure } from '@/lib/types';

export function useCurrencyExposure() {
  const { bankAccountId, from, to, granularity } = useDashboardStore();

  return useQuery({
    queryKey: ['dashboard', 'currency-exposure', { bankAccountId, from, to, granularity }],
    queryFn: async () => {
      const params = {
        from, to, granularity,
        ...(bankAccountId && { bankAccountId }),
      };
      const res = await api.get<CurrencyExposure[]>('/dashboard/currency-exposure', { params });
      return res.data;
    },
  });
}
