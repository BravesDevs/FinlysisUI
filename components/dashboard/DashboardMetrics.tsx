'use client';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { useAccountBalances } from '@/hooks/dashboard/useAccountBalances';
import { useCashFlow } from '@/hooks/dashboard/useCashFlow';
import { useBurnRate } from '@/hooks/dashboard/useBurnRate';

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

function LoadingCard() {
  return (
    <div className="grad-metric rounded-[16px] border border-[color:var(--border)] shadow-card px-5 py-5 animate-pulse">
      <div className="h-3 w-24 rounded bg-[var(--muted)] mb-3" />
      <div className="h-9 w-32 rounded bg-[var(--muted)]" />
    </div>
  );
}

export function DashboardMetrics() {
  const { data: accountsData, isLoading: accountsLoading } = useAccountBalances();
  const { data: cashFlowData, isLoading: cashFlowLoading } = useCashFlow();
  const { data: burnData, isLoading: burnLoading } = useBurnRate();

  // Total balance across all accounts
  const totalBalance = accountsData?.totals.totalCurrentBalanceCAD ?? 0;

  // Derive net flow from most recent period
  const periods = cashFlowData ?? [];
  const latestPeriod = periods[periods.length - 1];
  const prevPeriod   = periods[periods.length - 2];
  const netFlow = latestPeriod?.netFlow ?? 0;
  const totalInflow  = latestPeriod?.totalInflow  ?? 0;

  // Net flow trend vs previous period
  let netTrend: 'up' | 'down' | 'flat' = 'flat';
  let netTrendValue = '';
  if (prevPeriod && latestPeriod) {
    const delta = latestPeriod.netFlow - prevPeriod.netFlow;
    netTrend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
    netTrendValue = `${CAD.format(Math.abs(delta))} vs prev period`;
  }

  // Burn rate ratio
  const burnPct = burnData ? Math.round((Math.abs(burnData.currentMonthSpend) / Math.abs(burnData.avgPrevThreeMonths)) * 100) : 0;
  const burnTrend: 'up' | 'down' | 'flat' = burnPct > 110 ? 'up' : burnPct < 90 ? 'down' : 'flat';

  if (accountsLoading || cashFlowLoading || burnLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <LoadingCard /><LoadingCard /><LoadingCard /><LoadingCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Total Balance"
        value={CAD.format(totalBalance)}
        color={totalBalance >= 0 ? 'green' : 'red'}
      />
      <MetricCard
        label="Net Cash Flow"
        value={CAD.format(netFlow)}
        trend={netTrend}
        trendValue={netTrendValue}
        color={netFlow >= 0 ? 'green' : 'red'}
      />
      <MetricCard
        label="Total Inflow"
        value={CAD.format(totalInflow)}
        color="green"
      />
      <MetricCard
        label="Burn Rate"
        value={`${burnPct}%`}
        trend={burnTrend}
        trendValue={burnData ? `vs ${CAD.format(Math.abs(burnData.avgPrevThreeMonths))} avg` : undefined}
        color={burnPct > 110 ? 'red' : 'default'}
      />
    </div>
  );
}
