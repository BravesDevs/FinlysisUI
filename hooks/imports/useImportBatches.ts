'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { ImportBatch } from '@/lib/types';

export function useImportBatches() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['import', 'batches'],
    queryFn: async () => {
      const res = await api.get<ImportBatch[]>('/import/batches');
      return res.data;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 30,
    refetchInterval: (query) => {
      const batches = query.state.data;
      if (!batches) return false;
      const hasProcessing = batches.some((b) => b.status === 'PROCESSING');
      return hasProcessing ? 3000 : false;
    },
  });
}
