import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboard.store';
import { api } from '@/lib/api';
import type { RecurringVsOneOff } from '@/lib/types';

export function useRecurringVsOneOff() {
  const { bankAccountId, from, to, granularity } = useDashboardStore();

  return useQuery({
    queryKey: ['dashboard', 'recurring-vs-oneoff', { bankAccountId, from, to, granularity }],
    queryFn: async () => {
      const params = {
        from, to, granularity,
        ...(bankAccountId && { bankAccountId }),
      };
      const res = await api.get<RecurringVsOneOff>('/dashboard/recurring-vs-oneoff', { params });
      return res.data;
    },
  });
}
