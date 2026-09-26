type MonthPoint = { key: string; label: string; total: number };

type InvoiceRecurringBillingLineChartProps = {
  points: MonthPoint[];
  caption: string;
  title: string;
};

const WIDTH = 300;
const HEIGHT = 130;
const CHART_TOP = 20;
const CHART_BOTTOM = HEIGHT - 26;
const CHART_LEFT = 10;
const CHART_RIGHT = WIDTH - 10;

export default function InvoiceRecurringBillingLineChart({ points, caption, title }: InvoiceRecurringBillingLineChartProps) {
  const max = Math.max(...points.map((p) => p.total)) * 1.15;
  const min = 0;
  const stepX = (CHART_RIGHT - CHART_LEFT) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = CHART_LEFT + i * stepX;
    const frac = (p.total - min) / Math.max(max - min, 1);
    const y = CHART_BOTTOM - frac * (CHART_BOTTOM - CHART_TOP);
    return { ...p, x, y };
  });

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 280 }}>
          <line x1={CHART_LEFT} y1={CHART_BOTTOM} x2={CHART_RIGHT} y2={CHART_BOTTOM} stroke="currentColor" strokeWidth={1} opacity={0.2} />
          <path d={path} fill="none" className="stroke-indigo-500 dark:stroke-indigo-400" strokeWidth={2.5} strokeLinejoin="round" />
          {coords.map((c, i) => {
            // The first/last point's label would otherwise center on x=CHART_LEFT/CHART_RIGHT,
            // pushing half its text past the viewBox edge and clipping it — anchor those two
            // inward instead, same pattern used by RatioGauge's own extreme-tick labels.
            const anchor = i === 0 ? "start" : i === coords.length - 1 ? "end" : "middle";
            return (
              <g key={c.key}>
                <circle cx={c.x} cy={c.y} r={4} className="fill-indigo-600 dark:fill-indigo-400" />
                <text x={c.x} y={c.y - 10} textAnchor={anchor} fontSize={9} fontWeight={700} className="fill-indigo-700 dark:fill-indigo-300">
                  ${c.total.toFixed(0)}
                </text>
                <text x={c.x} y={CHART_BOTTOM + 14} textAnchor={anchor} fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
                  {c.label}
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
