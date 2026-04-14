import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboard.store';
import { api } from '@/lib/api';
import type { TagSummary, CashFlowPeriod } from '@/lib/types';

// All-tags summary
export function useTags() {
  const { bankAccountId, from, to, granularity } = useDashboardStore();

  return useQuery({
    queryKey: ['dashboard', 'tags', { bankAccountId, from, to, granularity }],
    queryFn: async () => {
      const params = {
        from, to, granularity,
        ...(bankAccountId && { bankAccountId }),
      };
      const res = await api.get<TagSummary[]>('/dashboard/tags', { params });
      return res.data;
    },
  });
}

// Per-tag cash flow drill-down
export function useTagCashFlow(tag: string | null) {
  const { bankAccountId, from, to, granularity } = useDashboardStore();

  return useQuery({
    queryKey: ['dashboard', 'tags', tag, { bankAccountId, from, to, granularity }],
    queryFn: async () => {
      const params = {
        tag: tag!,
        from, to, granularity,
        ...(bankAccountId && { bankAccountId }),
      };
      const res = await api.get<CashFlowPeriod[]>('/dashboard/tags', { params });
      return res.data;
    },
    enabled: !!tag,
  });
}
