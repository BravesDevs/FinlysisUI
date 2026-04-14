'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useSpendingByCategory } from '@/hooks/dashboard/useSpendingByCategory';
import { ChartCard } from '@/components/dashboard/ChartCard';

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

const PALETTE = [
  '#3ab4e8', '#1a6fa3', '#cbf2fe', '#90d9f7', '#1a7a4a',
  '#e8593c', '#f5a623', '#7b68ee', '#2ecc71', '#e74c3c',
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { pct: number } }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-[var(--bg-card)] border border-[color:var(--color-azure)] rounded-[10px] px-3 py-2.5 shadow-card text-[13px] font-sans min-w-[160px]">
      <p className="text-[12px] text-[var(--text-muted)] mb-1">{item.name}</p>
      <p className="font-medium text-[var(--text-primary)]">{CAD.format(item.value)}</p>
      <p className="text-[12px] text-[var(--text-muted)]">{item.payload.pct.toFixed(1)}%</p>
    </div>
  );
}

export function SpendingByCategoryChart() {
  const { data, isLoading, error } = useSpendingByCategory();

  const total = (data ?? []).reduce((sum, d) => sum + d.total, 0);
  const chartData = (data ?? []).map((d) => ({
    name: d.label,
    value: d.total,
    pct: total > 0 ? (d.total / total) * 100 : 0,
  }));

  return (
    <ChartCard
      title="Spending by Category"
      subtitle="Spend totals by category"
      isLoading={isLoading}
      error={error}
      isEmpty={!isLoading && !error && chartData.length === 0}
      height={300}
    >
      <div className="flex items-center gap-4 h-full">
        <div className="flex-shrink-0" style={{ width: 200, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Center label overlay */}
        <div className="absolute left-[calc(100px)] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none hidden" />

        {/* Legend */}
        <div className="flex-1 overflow-y-auto max-h-full pr-1 space-y-1.5">
          {chartData.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between gap-2 text-[12px] font-sans">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                <span className="text-[var(--text-secondary)] truncate">{item.name}</span>
              </div>
              <span className="text-[var(--text-primary)] font-medium flex-shrink-0">{item.pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
