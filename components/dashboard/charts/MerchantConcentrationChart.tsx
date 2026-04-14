'use client';

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useMerchantConcentration } from '@/hooks/dashboard/useMerchantConcentration';
import { ChartCard } from '@/components/dashboard/ChartCard';

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

// Interpolate between deep (#1a6fa3) and ice (#cbf2fe) by rank
function rankColor(rank: number, total: number): string {
  const t = total <= 1 ? 0 : rank / (total - 1);
  const r1 = 0x1a, g1 = 0x6f, b1 = 0xa3;
  const r2 = 0xcb, g2 = 0xf2, b2 = 0xfe;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

interface TreemapNodeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rank?: number;
  total?: number;
  name?: string;
  value?: number;
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, rank = 0, total = 1, name = '', value = 0 }: TreemapNodeProps) {
  const fill = rankColor(rank, total);
  const isLight = rank > total / 2;
  const textColor = isLight ? '#1a6fa3' : '#ffffff';
  const showText = width > 48 && height > 28;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} />
      {showText && (
        <>
          <text x={x + 6} y={y + 16} fill={textColor} fontSize={11} fontFamily="var(--font-inter)" fontWeight={500} className="select-none">
            {name.length > 16 ? name.slice(0, 14) + '…' : name}
          </text>
          {height > 44 && (
            <text x={x + 6} y={y + 30} fill={textColor} fontSize={10} fontFamily="var(--font-inter)" opacity={0.8} className="select-none">
              {CAD.format(value)}
            </text>
          )}
        </>
      )}
    </g>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; value: number } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[var(--bg-card)] border border-[color:var(--color-azure)] rounded-[10px] px-3 py-2.5 shadow-card text-[13px] font-sans">
      <p className="text-[12px] text-[var(--text-muted)] mb-1">{d.name}</p>
      <p className="font-medium text-[var(--text-primary)]">{CAD.format(d.value)}</p>
    </div>
  );
}

export function MerchantConcentrationChart() {
  const { data, isLoading, error } = useMerchantConcentration();

  const chartData = (data ?? []).map((d, i) => ({
    name: d.merchantName,
    value: d.total,
    rank: i,
    total: data?.length ?? 1,
  }));

  return (
    <ChartCard
      title="Merchant Concentration"
      subtitle="Top merchants by spend"
      isLoading={isLoading}
      error={error}
      isEmpty={!isLoading && !error && chartData.length === 0}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={chartData}
          dataKey="value"
          content={<CustomContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </ChartCard>
  );
}
