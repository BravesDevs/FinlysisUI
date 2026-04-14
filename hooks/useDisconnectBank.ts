'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export function useDisconnectBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ plaidItemId }: { plaidItemId: string }) => {
      await api.post('/plaid/disconnect', { plaidItemId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['plaid', 'items'] });
      toast.success('Bank account disconnected.');
    },
    onError: () => {
      toast.error('Could not disconnect. Please try again.');
    },
  });
}
