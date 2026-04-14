'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useLinkToken() {
  return useQuery({
    queryKey: ['plaid', 'link-token'],
    queryFn: async () => {
      const res = await api.post<{ link_token: string }>('/plaid/link-token');
      return res.data.link_token;
    },
    enabled: false,   // Only fetch on explicit refetch() call
    staleTime: 0,     // Never treat result as fresh — always fetch anew
    gcTime: 0,        // Immediately discard after use
    retry: false,
  });
}
