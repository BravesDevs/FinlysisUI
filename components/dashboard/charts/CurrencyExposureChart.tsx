'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useCurrencyExposure } from '@/hooks/dashboard/useCurrencyExposure';
import { ChartCard } from '@/components/dashboard/ChartCard';

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

const COLORS = ['#3ab4e8', '#1a6fa3', '#90d9f7', '#cbf2fe', '#1a7a4a', '#e8593c'];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { currencyCode: string; totalCAD: number } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[var(--bg-card)] border border-[color:var(--color-azure)] rounded-[10px] px-3 py-2.5 shadow-card text-[13px] font-sans min-w-[140px]">
      <p className="text-[12px] text-[var(--text-muted)] mb-1">{d.currencyCode}</p>
      <p className="font-medium text-[var(--text-primary)]">{CAD.format(d.totalCAD)}</p>
    </div>
  );
}

export function CurrencyExposureChart() {
  const { data, isLoading, error } = useCurrencyExposure();

  const chartData = (data ?? []).map((d) => ({
    currencyCode: d.currencyCode,
    totalCAD: Math.abs(d.totalCAD),
  }));

  return (
    <ChartCard
      title="Currency Exposure"
      subtitle="Spend by currency, normalised to CAD"
      isLoading={isLoading}
      error={error}
      isEmpty={!isLoading && !error && chartData.length === 0}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,180,232,0.18)" horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => CAD.format(v)} tick={{ fontSize: 11, fontFamily: 'var(--font-inter)', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="currencyCode" tick={{ fontSize: 11, fontFamily: 'var(--font-inter)', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalCAD" radius={[0, 3, 3, 0]} maxBarSize={28}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
