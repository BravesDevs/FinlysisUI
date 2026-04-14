'use client';

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useCashFlow } from '@/hooks/dashboard/useCashFlow';
import { ChartCard } from '@/components/dashboard/ChartCard';

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

function formatPeriod(period: string) {
  try {
    const d = period.length === 7 ? parseISO(period + '-01') : parseISO(period);
    return period.length === 7 ? format(d, 'MMM yy') : format(d, 'MMM d');
  } catch { return period; }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-card)] border border-[color:var(--color-azure)] rounded-[10px] px-3 py-2.5 shadow-card text-[13px] font-sans min-w-[160px]">
      <p className="text-[12px] text-[var(--text-muted)] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium text-[var(--text-primary)]">{CAD.format(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function CashFlowChart() {
  const { data, isLoading, error } = useCashFlow();

  const chartData = (data ?? []).map((d) => ({
    period: formatPeriod(d.period),
    Inflow: d.totalInflow,
    Outflow: Math.abs(d.totalOutflow),
    'Net Flow': d.netFlow,
  }));

  return (
    <ChartCard
      title="Cash Flow"
      subtitle="Inflows, outflows and net per period"
      isLoading={isLoading}
      error={error}
      isEmpty={!isLoading && !error && chartData.length === 0}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,180,232,0.18)" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 11, fontFamily: 'var(--font-inter)', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => CAD.format(v)} tick={{ fontSize: 11, fontFamily: 'var(--font-inter)', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={72} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-inter)', paddingTop: 8 }} />
          <Bar dataKey="Inflow"   fill="#3ab4e8" radius={[3, 3, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Outflow"  fill="#e8593c" radius={[3, 3, 0, 0]} maxBarSize={40} />
          <Line dataKey="Net Flow" stroke="#1a6fa3" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
