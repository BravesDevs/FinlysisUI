'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useCumulativeBalance } from '@/hooks/dashboard/useCumulativeBalance';
import { ChartCard } from '@/components/dashboard/ChartCard';

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-card)] border border-[color:var(--color-azure)] rounded-[10px] px-3 py-2.5 shadow-card text-[13px] font-sans min-w-[160px]">
      <p className="text-[12px] text-[var(--text-muted)] mb-1">{label}</p>
      <p className="font-medium text-[var(--text-primary)]">{CAD.format(payload[0].value)}</p>
    </div>
  );
}

export function CumulativeBalanceChart() {
  const { data, isLoading, error } = useCumulativeBalance();

  const chartData = (data ?? []).map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    balance: d.balance,
  }));

  return (
    <ChartCard
      title="Cumulative Balance"
      subtitle="Running balance over time"
      isLoading={isLoading}
      error={error}
      isEmpty={!isLoading && !error && chartData.length === 0}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="iceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbf2fe" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,180,232,0.18)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'var(--font-inter)', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => CAD.format(v)} tick={{ fontSize: 11, fontFamily: 'var(--font-inter)', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={72} />
          <Tooltip content={<CustomTooltip />} />
          <Area dataKey="balance" stroke="#3ab4e8" strokeWidth={2} fill="url(#iceGradient)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
