'use client';

import { useMemo } from 'react';
import { Landmark } from 'lucide-react';
import { useAccountBalances } from '@/hooks/dashboard/useAccountBalances';
import { usePlaidItems } from '@/hooks/usePlaidItems';
import { BankAccountCard } from '@/components/accounts/BankAccountCard';
import { PlaidLinkButton } from '@/components/accounts/PlaidLinkButton';
import type { PlaidItem } from '@/lib/types';

// ---------------------------------------------------------------------------
// Currency formatter
// ---------------------------------------------------------------------------

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="animate-pulse" style={{ height: '20px', width: '140px', background: 'var(--muted)', borderRadius: '6px' }} />
          <div className="animate-pulse" style={{ height: '14px', width: '90px', background: 'var(--muted)', borderRadius: '6px' }} />
        </div>
        <div className="animate-pulse" style={{ height: '20px', width: '72px', background: 'var(--muted)', borderRadius: '99px' }} />
      </div>
      {/* Account number skeleton */}
      <div className="animate-pulse" style={{ height: '14px', width: '120px', background: 'var(--muted)', borderRadius: '6px' }} />
      {/* Balance skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="animate-pulse" style={{ height: '24px', width: '160px', background: 'var(--muted)', borderRadius: '6px' }} />
        <div className="animate-pulse" style={{ height: '13px', width: '120px', background: 'var(--muted)', borderRadius: '6px' }} />
        <div className="animate-pulse" style={{ height: '12px', width: '100px', background: 'var(--muted)', borderRadius: '6px' }} />
      </div>
      {/* Footer skeleton */}
      <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="animate-pulse" style={{ height: '12px', width: '80px', background: 'var(--muted)', borderRadius: '6px' }} />
          <div className="animate-pulse" style={{ height: '12px', width: '60px', background: 'var(--muted)', borderRadius: '6px' }} />
        </div>
        <div className="animate-pulse" style={{ height: '14px', width: '64px', background: 'var(--muted)', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AccountsPage() {
  const {
    data: balancesData,
    isLoading,
    isError,
    refetch,
  } = useAccountBalances();

  const { data: plaidItems } = usePlaidItems();

  // Build institution-name → PlaidItem map for badge matching
  const plaidItemByInstitution = useMemo<Record<string, PlaidItem>>(() => {
    if (!plaidItems) return {};
    const map: Record<string, PlaidItem> = {};
    for (const item of plaidItems) {
      if (item.institutionName) {
        map[item.institutionName.toLowerCase()] = item;
      }
    }
    return map;
  }, [plaidItems]);

  const accounts = balancesData?.accounts ?? [];
  const totals = balancesData?.totals;

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ background: 'var(--bg-page)', fontStyle: 'normal' }}
    >
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <header
        className="grad-hero border-b"
        style={{
          borderColor: 'var(--border)',
          padding: '0 32px',
          minHeight: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-bodoni), Georgia, serif',
              fontWeight: 700,
              fontSize: '32px',
              color: 'var(--text-primary)',
              fontStyle: 'normal',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Accounts
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: 'var(--text-muted)',
              fontStyle: 'normal',
              margin: '2px 0 0',
            }}
          >
            Your connected bank accounts
          </p>
        </div>
        <PlaidLinkButton />
      </header>

      {/* ── Totals summary bar ─────────────────────────────────────────────── */}
      {totals && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 32px',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            gap: '0',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: 'var(--text-muted)',
                fontStyle: 'normal',
              }}
            >
              Total current balance (CAD)
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                color: 'var(--text-primary)',
                fontStyle: 'normal',
              }}
            >
              {CAD.format(totals.totalCurrentBalanceCAD)}
            </span>
          </div>

          <div
            style={{
              width: '1px',
              height: '36px',
              background: 'var(--border)',
              margin: '0 24px',
              flexShrink: 0,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: 'var(--text-muted)',
                fontStyle: 'normal',
              }}
            >
              Total available balance (CAD)
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                color: 'var(--text-primary)',
                fontStyle: 'normal',
              }}
            >
              {CAD.format(totals.totalAvailableBalanceCAD)}
            </span>
          </div>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main style={{ padding: '0 32px 48px', flex: 1 }}>
        {/* Loading state */}
        {isLoading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '20px',
              paddingTop: '24px',
            }}
          >
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              gap: '12px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                color: 'var(--destructive)',
                fontStyle: 'normal',
                margin: 0,
              }}
            >
              Unable to load accounts. Please try again.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 500,
                fontSize: '13px',
                color: 'var(--color-azure)',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 16px',
                cursor: 'pointer',
                fontStyle: 'normal',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && accounts.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              gap: '16px',
              textAlign: 'center',
            }}
          >
            <Landmark size={48} style={{ color: 'var(--text-muted)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontWeight: 500,
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                  fontStyle: 'normal',
                  margin: 0,
                }}
              >
                No bank accounts connected
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  fontStyle: 'normal',
                  margin: 0,
                }}
              >
                Connect your first bank account to get started.
              </p>
            </div>
            <PlaidLinkButton />
          </div>
        )}

        {/* Accounts grid */}
        {!isLoading && !isError && accounts.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '20px',
              paddingTop: '24px',
            }}
          >
            {accounts.map((account) => {
              const plaidItem =
                plaidItemByInstitution[account.bank.name?.toLowerCase() ?? ''] ?? null;
              return (
                <BankAccountCard
                  key={account.id}
                  account={account}
                  plaidItem={plaidItem}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
