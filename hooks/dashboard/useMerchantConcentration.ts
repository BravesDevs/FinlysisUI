import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboard.store';
import { api } from '@/lib/api';
import type { MerchantSlice } from '@/lib/types';

export function useMerchantConcentration() {
  const { bankAccountId, from, to, granularity } = useDashboardStore();

  return useQuery({
    queryKey: ['dashboard', 'merchant-concentration', { bankAccountId, from, to, granularity }],
    queryFn: async () => {
      const params = {
        from, to, granularity,
        ...(bankAccountId && { bankAccountId }),
      };
      const res = await api.get<MerchantSlice[]>('/dashboard/merchant-concentration', { params });
      return res.data;
    },
  });
}
