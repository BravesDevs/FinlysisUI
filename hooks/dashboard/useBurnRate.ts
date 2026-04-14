import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboard.store';
import { api } from '@/lib/api';
import type { BurnRate } from '@/lib/types';

export function useBurnRate() {
  const { bankAccountId } = useDashboardStore();

  return useQuery({
    queryKey: ['dashboard', 'burn-rate', { bankAccountId }],
    queryFn: async () => {
      // burn-rate ignores from/to/granularity — uses current vs 3-month avg internally
      const params = bankAccountId ? { bankAccountId } : {};
      const res = await api.get<BurnRate>('/dashboard/burn-rate', { params });
      return res.data;
    },
  });
}
