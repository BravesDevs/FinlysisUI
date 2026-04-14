import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AccountBalancesResponse } from '@/lib/types';

export function useAccountBalances() {
  return useQuery({
    queryKey: ['accounts', 'balances'],
    queryFn: async () => {
      const res = await api.get<AccountBalancesResponse>('/accounts/balances');
      return res.data;
    },
  });
}
