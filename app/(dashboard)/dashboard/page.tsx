import { FilterBar } from '@/components/dashboard/FilterBar';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { CashFlowChart } from '@/components/dashboard/charts/CashFlowChart';
import { CumulativeBalanceChart } from '@/components/dashboard/charts/CumulativeBalanceChart';
import { SpendingByCategoryChart } from '@/components/dashboard/charts/SpendingByCategoryChart';
import { MerchantConcentrationChart } from '@/components/dashboard/charts/MerchantConcentrationChart';
import { RecurringVsOneOffChart } from '@/components/dashboard/charts/RecurringVsOneOffChart';
import { BurnRateChart } from '@/components/dashboard/charts/BurnRateChart';
import { CurrencyExposureChart } from '@/components/dashboard/charts/CurrencyExposureChart';
import { TagsChart } from '@/components/dashboard/charts/TagsChart';

export default function DashboardPage() {
  return (
    <>
      {/* Page header */}
      <header className="grad-card border-b border-[color:var(--border)] px-8 py-5">
        <h1 className="type-page-title text-[var(--color-ink)]">Dashboard</h1>
        <p className="text-[13px] text-[var(--text-muted)] font-sans mt-0.5">
          Financial overview across your accounts
        </p>
      </header>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20">
        <FilterBar />
      </div>

      {/* Content */}
      <main className="flex-1 px-8 py-6 space-y-6">
        {/* Metric row */}
        <DashboardMetrics />

        {/* Row 1: Cash Flow + Cumulative Balance */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <CashFlowChart />
          <CumulativeBalanceChart />
        </div>

        {/* Row 2: Spending by Category + Merchant Concentration */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* <SpendingByCategoryChart /> */}
          {/* <MerchantConcentrationChart /> */}
        </div>

        {/* Row 3: Recurring vs One-off + Burn Rate + Currency Exposure */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <RecurringVsOneOffChart />
          <BurnRateChart />
          <CurrencyExposureChart />
        </div>

        {/* Row 4: Tags (full width) */}
        <TagsChart />
      </main>
    </>
  );
}
