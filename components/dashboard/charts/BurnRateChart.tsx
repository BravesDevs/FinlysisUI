'use client';

import { useBurnRate } from '@/hooks/dashboard/useBurnRate';
import { ChartCard } from '@/components/dashboard/ChartCard';

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

function GaugeArc({ pct }: { pct: number }) {
  // Half-circle arc: M 20 105 A 80 80 0 0 1 180 105
  // Total arc length ≈ π * r = π * 80 ≈ 251.3
  const arcLength = Math.PI * 80;
  const filled = Math.min(Math.max(pct, 0), 1) * arcLength;

  return (
    <svg viewBox="0 0 200 120" className="w-full" style={{ maxWidth: 220 }}>
      {/* Track */}
      <path
        d="M 20 105 A 80 80 0 0 1 180 105"
        fill="none"
        stroke="rgba(58,180,232,0.15)"
        strokeWidth={14}
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d="M 20 105 A 80 80 0 0 1 180 105"
        fill="none"
        stroke={pct > 1 ? '#e8593c' : '#3ab4e8'}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${arcLength}`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Center pct label */}
      <text x="100" y="92" textAnchor="middle" fontSize={22} fontFamily="var(--font-bodoni), Georgia, 'Times New Roman', serif" fontWeight={900} fontStyle="normal" fill="var(--color-ink)">
        {Math.round(pct * 100)}%
      </text>
      <text x="100" y="108" textAnchor="middle" fontSize={10} fontFamily="var(--font-inter)" fill="var(--text-muted)">
        vs 3-month avg
      </text>
    </svg>
  );
}

export function BurnRateChart() {
  const { data, isLoading, error } = useBurnRate();

  const pct = data ? (Math.abs(data.currentMonthSpend) / Math.abs(data.avgPrevThreeMonths)) : 0;

  return (
    <ChartCard
      title="Burn Rate"
      subtitle="Current month vs 3-month average"
      isLoading={isLoading}
      error={error}
      isEmpty={!isLoading && !error && !data}
      height={300}
    >
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <GaugeArc pct={pct} />

        <div className="flex gap-6 text-center">
          <div>
            <p className="type-ui-label text-[var(--text-muted)]">This Month</p>
            <p className="font-heading font-black not-italic text-[1.25rem] tracking-[-0.03em] leading-none text-[var(--color-ink)] mt-1">
              {CAD.format(Math.abs(data?.currentMonthSpend ?? 0))}
            </p>
          </div>
          <div className="w-px bg-[color:var(--border)]" />
          <div>
            <p className="type-ui-label text-[var(--text-muted)]">3-Mo Avg</p>
            <p className="font-heading font-black not-italic text-[1.25rem] tracking-[-0.03em] leading-none text-[var(--color-ink)] mt-1">
              {CAD.format(Math.abs(data?.avgPrevThreeMonths ?? 0))}
            </p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
