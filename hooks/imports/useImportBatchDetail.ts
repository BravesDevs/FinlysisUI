'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { ImportBatchDetail } from '@/lib/types';

export function useImportBatchDetail(id: string | null) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['import', 'batches', id],
    queryFn: async () => {
      const res = await api.get<ImportBatchDetail>(`/import/batches/${id}`);
      return res.data;
    },
    enabled: !!id && !!accessToken,
  });
}
