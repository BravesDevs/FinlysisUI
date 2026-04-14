'use client';

import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  color?: 'default' | 'green' | 'red';
}

const trendIcons = { up: '↑', down: '↓', flat: '→' } as const;

const trendColors = {
  up:   'text-[#1a7a4a]',
  down: 'text-[#c0392b]',
  flat: 'text-[var(--text-muted)]',
} as const;

export function MetricCard({
  label,
  value,
  trend,
  trendValue,
  color = 'default',
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'grad-metric rounded-[16px] border border-[color:var(--border)] shadow-card px-5 py-5',
        color === 'green' && 'border-[color:rgba(26,122,74,0.20)]',
        color === 'red'   && 'border-[color:rgba(192,57,43,0.20)]',
      )}
    >
      {/* Label — Inter 500 12px uppercase per spec */}
      <p className="type-table-header mb-3">{label}</p>

      {/* Value — Bodoni Moda 900 italic 36px per spec */}
      <p className="font-heading font-black italic text-[2.25rem] tracking-[-0.03em] leading-none text-[var(--color-ink)]">
        {value}
      </p>

      {/* Trend badge — Inter 500 13px */}
      {trend && trendValue && (
        <div className={cn('mt-2.5 text-[13px] font-medium font-sans', trendColors[trend])}>
          {trendIcons[trend]} {trendValue}
        </div>
      )}
    </div>
  );
}
