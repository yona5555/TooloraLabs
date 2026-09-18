type ColumnItem = { key: string; label: string; totalCost: number };

type SalesTaxJurisdictionCompareChartProps = {
  items: ColumnItem[];
  caption: string;
  title: string;
};

const WIDTH = 320;
const HEIGHT = 150;
const CHART_TOP = 14;
const CHART_BOTTOM = HEIGHT - 34;
const CHART_H = CHART_BOTTOM - CHART_TOP;

export default function SalesTaxJurisdictionCompareChart({ items, caption, title }: SalesTaxJurisdictionCompareChartProps) {
  const max = Math.max(...items.map((i) => i.totalCost), 1);
  const min = Math.min(...items.map((i) => i.totalCost), 0);
  const colW = WIDTH / items.length;
  const barW = colW * 0.5;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 300 }}>
          <line x1={0} y1={CHART_BOTTOM} x2={WIDTH} y2={CHART_BOTTOM} stroke="currentColor" strokeWidth={1} opacity={0.25} />
          {items.map((item, i) => {
            const x = i * colW + (colW - barW) / 2;
            const frac = (item.totalCost - min) / Math.max(max - min, 1);
            const h = Math.max(CHART_H * frac, 4);
            const y = CHART_BOTTOM - h;
            return (
              <g key={item.key}>
                <rect x={x} y={y} width={barW} height={h} rx={4} className="fill-amber-500 dark:fill-amber-400" />
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
                  ${item.totalCost.toFixed(2)}
                </text>
                <text x={x + barW / 2} y={CHART_BOTTOM + 14} textAnchor="middle" fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
