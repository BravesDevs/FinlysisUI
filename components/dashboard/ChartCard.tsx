'use client';

import type { ReactNode } from 'react';
import { CalendarX } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  error?: Error | null | unknown;
  height?: number;
  isEmpty?: boolean;
}

export function ChartCard({
  title,
  subtitle,
  children,
  isLoading = false,
  error,
  height = 280,
  isEmpty = false,
}: ChartCardProps) {
  return (
    <div className="rounded-[16px] bg-[var(--bg-card)] border border-[color:var(--border)] shadow-card overflow-hidden">
      {/* Header — grad-card strip */}
      <div className="grad-card border-b border-[color:var(--border)] px-5 py-4">
        <h2 className="type-section-heading text-[var(--text-primary)]">{title}</h2>
        {subtitle && (
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5 font-sans">{subtitle}</p>
        )}
      </div>

      {/* Body */}
      <div className="p-5" style={{ height }}>
        {isLoading ? (
          <div className="w-full h-full rounded-[12px] bg-[var(--muted)] animate-pulse" />
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[14px] text-[var(--text-muted)] font-sans">
              Unable to load data
            </p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <CalendarX className="size-5 text-[var(--text-muted)]" />
            <p className="text-[14px] text-[var(--text-muted)] font-sans">
              No data for this period
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
