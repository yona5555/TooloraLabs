type ImpactColumn = { key: string; label: string; cogs: number; colorClass: string };

type InventoryTaxImpactBarProps = {
  columns: ImpactColumn[];
  cogsLabel: string;
  caption: string;
  title: string;
};

const WIDTH = 260;
const HEIGHT = 150;
const CHART_TOP = 14;
const CHART_BOTTOM = HEIGHT - 34;
const CHART_H = CHART_BOTTOM - CHART_TOP;

export default function InventoryTaxImpactBar({ columns, cogsLabel, caption, title }: InventoryTaxImpactBarProps) {
  const max = Math.max(...columns.map((c) => c.cogs), 1);
  const colW = WIDTH / columns.length;
  const barW = colW * 0.5;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 240 }}>
          <text x={WIDTH / 2} y={10} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {cogsLabel}
          </text>
          <line x1={0} y1={CHART_BOTTOM} x2={WIDTH} y2={CHART_BOTTOM} stroke="currentColor" strokeWidth={1} opacity={0.25} />
          {columns.map((col, i) => {
            const x = i * colW + (colW - barW) / 2;
            const h = (col.cogs / max) * CHART_H;
            const y = CHART_BOTTOM - h;
            return (
              <g key={col.key}>
                <rect x={x} y={y} width={barW} height={h} rx={4} className={col.colorClass} />
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
                  ${col.cogs}
                </text>
                <text x={x + barW / 2} y={CHART_BOTTOM + 14} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
                  {col.label}
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
