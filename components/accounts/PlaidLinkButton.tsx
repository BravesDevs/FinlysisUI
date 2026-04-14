'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useLinkToken } from '@/hooks/useLinkToken';
import type { PlaidLinkOnSuccess, PlaidLinkOnExit } from 'react-plaid-link';

interface PlaidLinkButtonProps {
  label?: string;
  className?: string;
}

export function PlaidLinkButton({ label = 'Add Bank', className }: PlaidLinkButtonProps) {
  const queryClient = useQueryClient();
  const { data: linkToken, refetch, isFetching } = useLinkToken();

  // Track whether we should open Plaid after the token arrives
  const shouldOpenRef = useRef(false);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken) => {
      // public_token is used immediately and never stored
      try {
        await api.post('/plaid/exchange-token', { publicToken });
        queryClient.invalidateQueries({ queryKey: ['accounts', 'balances'] });
        queryClient.invalidateQueries({ queryKey: ['plaid', 'items'] });
        toast.success('Bank connected successfully.');
      } catch {
        toast.error('Unable to connect bank. Please try again.');
      } finally {
        // Discard the link token — never reuse
        queryClient.removeQueries({ queryKey: ['plaid', 'link-token'] });
      }
    },
    [queryClient],
  );

  const onExit = useCallback<PlaidLinkOnExit>(
    (error) => {
      queryClient.removeQueries({ queryKey: ['plaid', 'link-token'] });
      if (error !== null) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Plaid] exit error_code:', error.error_code);
        }
        toast.error('Bank connection was interrupted. Please try again.');
      }
    },
    [queryClient],
  );

  const { open, ready } = usePlaidLink({
    token: linkToken ?? null,
    onSuccess,
    onExit,
  });

  // Open Plaid Link as soon as token is available and the SDK is ready
  useEffect(() => {
    if (ready && linkToken && shouldOpenRef.current) {
      shouldOpenRef.current = false;
      open();
    }
  }, [ready, linkToken, open]);

  const handleClick = async () => {
    shouldOpenRef.current = true;
    await refetch();
  };

  const isLoading = isFetching;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={[
        'grad-button flex items-center gap-2 text-white font-sans font-medium text-[14px]',
        'rounded-[10px] px-5 py-[10px] transition-opacity disabled:opacity-70 cursor-pointer',
        'disabled:cursor-not-allowed',
        className ?? '',
      ].join(' ')}
      style={{ fontStyle: 'normal' }}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Plus size={16} />
      )}
      {isLoading ? 'Connecting…' : label}
    </button>
  );
}
