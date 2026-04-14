'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { PlaidItem } from '@/lib/types';

export function usePlaidItems() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['plaid', 'items'],
    queryFn: async () => {
      const res = await api.get<PlaidItem[]>('/plaid/items');
      return res.data;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 2,
  });
}
