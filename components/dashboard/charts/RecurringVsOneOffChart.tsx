'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useRecurringVsOneOff } from '@/hooks/dashboard/useRecurringVsOneOff';
import { ChartCard } from '@/components/dashboard/ChartCard';

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

const COLORS = { recurring: '#3ab4e8', oneOff: '#e8593c' };

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-card)] border border-[color:var(--color-azure)] rounded-[10px] px-3 py-2.5 shadow-card text-[13px] font-sans min-w-[140px]">
      <p className="text-[12px] text-[var(--text-muted)] mb-1">{payload[0].name}</p>
      <p className="font-medium text-[var(--text-primary)]">{CAD.format(payload[0].value)}</p>
    </div>
  );
}

export function RecurringVsOneOffChart() {
  const { data, isLoading, error } = useRecurringVsOneOff();

  const recurringAmt = Math.abs(data?.recurring.total ?? 0);
  const oneOffAmt    = Math.abs(data?.oneOff.total    ?? 0);
  const total        = recurringAmt + oneOffAmt;

  const recurringPct = total > 0 ? ((recurringAmt / total) * 100).toFixed(1) : '0.0';
  const oneOffPct    = total > 0 ? ((oneOffAmt    / total) * 100).toFixed(1) : '0.0';

  const chartData = data
    ? [
        { name: 'Recurring', value: recurringAmt },
        { name: 'One-off',   value: oneOffAmt },
      ]
    : [];

  return (
    <ChartCard
      title="Recurring vs One-off"
      subtitle="Recurring vs one-time spending breakdown"
      isLoading={isLoading}
      error={error}
      isEmpty={!isLoading && !error && !data}
      height={300}
    >
      <div className="flex items-center gap-6 h-full">
        <div className="flex-shrink-0" style={{ width: 180, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                <Cell fill={COLORS.recurring} />
                <Cell fill={COLORS.oneOff} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stat rows */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.recurring }} />
              <span className="text-[12px] font-sans text-[var(--text-muted)]">Recurring</span>
            </div>
            <p className="font-heading font-black not-italic text-[1.5rem] tracking-[-0.03em] leading-none text-[var(--color-ink)]">
              {CAD.format(recurringAmt)}
            </p>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{recurringPct}% of total</p>
          </div>

          <div className="h-px bg-[color:var(--border)]" />

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.oneOff }} />
              <span className="text-[12px] font-sans text-[var(--text-muted)]">One-off</span>
            </div>
            <p className="font-heading font-black not-italic text-[1.5rem] tracking-[-0.03em] leading-none text-[var(--color-ink)]">
              {CAD.format(oneOffAmt)}
            </p>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{oneOffPct}% of total</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
