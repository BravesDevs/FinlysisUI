'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PlaidLinkButton } from '@/components/accounts/PlaidLinkButton';
import { useDisconnectBank } from '@/hooks/useDisconnectBank';
import type { AccountBalance, PlaidItem, PlaidItemStatus } from '@/lib/types';

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<
  PlaidItemStatus,
  { bg: string; text: string; label: string }
> = {
  ACTIVE:  { bg: '#dcfce7', text: '#166534', label: 'Connected' },
  EXPIRED: { bg: '#fef9c3', text: '#854d0e', label: 'Re-auth needed' },
  REVOKED: { bg: '#fee2e2', text: '#991b1b', label: 'Disconnected' },
  ERROR:   { bg: '#fee2e2', text: '#991b1b', label: 'Error' },
};

function StatusBadge({ status }: { status: PlaidItemStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        fontStyle: 'normal',
        borderRadius: '99px',
        padding: '2px 10px',
        fontSize: '11px',
        fontWeight: 500,
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Currency formatter
// ---------------------------------------------------------------------------

function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BankAccountCardProps {
  account: AccountBalance;
  plaidItem: PlaidItem | null;
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export function BankAccountCard({ account, plaidItem }: BankAccountCardProps) {
  const { mutate: disconnect, isPending } = useDisconnectBank();
  const [dialogOpen, setDialogOpen] = useState(false);

  const bankName = account.bank.name ?? 'Unknown Bank';
  const balanceAsOf = (() => {
    try {
      return format(new Date(account.balanceAsOf), 'MMM dd, yyyy hh:mm a');
    } catch {
      return account.balanceAsOf;
    }
  })();

  const handleDisconnect = () => {
    if (!plaidItem) return;
    disconnect({ plaidItemId: plaidItem.id });
    setDialogOpen(false);
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        fontStyle: 'normal',
      }}
    >
      {/* ── Card header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-bodoni), Georgia, serif',
              fontWeight: 700,
              fontSize: '18px',
              color: 'var(--text-primary)',
              fontStyle: 'normal',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {bankName}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontStyle: 'normal',
              margin: '2px 0 0',
            }}
          >
            {account.accountType.label}
          </p>
        </div>
        {plaidItem && <StatusBadge status={plaidItem.status} />}
      </div>

      {/* ── Re-auth banner (EXPIRED only) ────────────────────────────────── */}
      {plaidItem?.status === 'EXPIRED' && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: '#fefce8',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              color: '#854d0e',
              fontStyle: 'normal',
              margin: 0,
            }}
          >
            Your session with this bank has expired. Re-connect to continue syncing.
          </p>
          <PlaidLinkButton label="Re-connect" />
        </div>
      )}

      {/* ── Account identifier ───────────────────────────────────────────── */}
      <div style={{ marginTop: '14px' }}>
        {account.nickname && (
          <p
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: 'var(--text-primary)',
              fontStyle: 'normal',
              margin: '0 0 2px',
            }}
          >
            {account.nickname}
          </p>
        )}
        {account.accountNumberMasked && (
          <p
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontStyle: 'normal',
              margin: 0,
            }}
          >
            {account.accountNumberMasked}
          </p>
        )}
      </div>

      {/* ── Balance row ──────────────────────────────────────────────────── */}
      <div style={{ marginTop: '16px' }}>
        <p
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '20px',
            color: 'var(--text-primary)',
            fontStyle: 'normal',
            margin: '0 0 2px',
            lineHeight: 1.2,
          }}
        >
          {formatCurrency(account.currentBalance, account.currency.code)}
        </p>
        {account.availableBalance !== null && (
          <p
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontStyle: 'normal',
              margin: '0 0 2px',
            }}
          >
            Available: {formatCurrency(account.availableBalance, account.currency.code)}
          </p>
        )}
        <p
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontStyle: 'normal',
            margin: 0,
          }}
        >
          As of {balanceAsOf}
        </p>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Transit / institution numbers — never full account number */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {account.currency.code && (
            <span
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontStyle: 'normal',
              }}
            >
              Currency:{' '}
              <span
                style={{ fontFamily: 'var(--font-mono-custom), JetBrains Mono, monospace' }}
              >
                {account.currency.code}
              </span>
            </span>
          )}
          {account.isActive !== undefined && (
            <span
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontStyle: 'normal',
              }}
            >
              Status:{' '}
              <span style={{ fontFamily: 'var(--font-mono-custom), JetBrains Mono, monospace' }}>
                {account.isActive ? 'Active' : 'Inactive'}
              </span>
            </span>
          )}
        </div>

        {/* Disconnect button — only if we have a plaid item to disconnect */}
        {plaidItem && (
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#991b1b',
                  fontStyle: 'normal',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  whiteSpace: 'nowrap',
                }}
              >
                Disconnect
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle style={{ fontStyle: 'normal' }}>
                  Disconnect {bankName}?
                </AlertDialogTitle>
                <AlertDialogDescription style={{ fontStyle: 'normal' }}>
                  This will remove access to this bank account. Your existing transactions will
                  not be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel style={{ fontStyle: 'normal' }}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisconnect}
                  disabled={isPending}
                  className="grad-button text-white border-none"
                  style={{ fontStyle: 'normal' }}
                >
                  {isPending ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Loader2 size={14} className="animate-spin" /> Disconnecting…
                    </span>
                  ) : (
                    'Yes, disconnect'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
