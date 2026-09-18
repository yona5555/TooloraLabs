type MonthPoint = { key: string; label: string; cumulativeUnits: number };

type BreakEvenMonthlyPaceLineChartProps = {
  points: MonthPoint[];
  breakEvenLabel: string;
  caption: string;
  title: string;
};

const WIDTH = 300;
const HEIGHT = 130;
const CHART_TOP = 20;
const CHART_BOTTOM = HEIGHT - 26;
const CHART_LEFT = 10;
const CHART_RIGHT = WIDTH - 10;
const BREAK_EVEN_UNITS = 334;

export default function BreakEvenMonthlyPaceLineChart({ points, breakEvenLabel, caption, title }: BreakEvenMonthlyPaceLineChartProps) {
  const max = BREAK_EVEN_UNITS * 1.1;
  const stepX = (CHART_RIGHT - CHART_LEFT) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = CHART_LEFT + i * stepX;
    const y = CHART_BOTTOM - (p.cumulativeUnits / max) * (CHART_BOTTOM - CHART_TOP);
    return { ...p, x, y };
  });

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const breakEvenY = CHART_BOTTOM - (BREAK_EVEN_UNITS / max) * (CHART_BOTTOM - CHART_TOP);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 280 }}>
          <line x1={CHART_LEFT} y1={breakEvenY} x2={CHART_RIGHT} y2={breakEvenY} className="stroke-rose-400 dark:stroke-rose-400/70" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={CHART_LEFT} y={breakEvenY - 5} fontSize={8} fontWeight={700} className="fill-rose-600 dark:fill-rose-400">
            {breakEvenLabel}
          </text>
          <path d={path} fill="none" className="stroke-cyan-500 dark:stroke-cyan-400" strokeWidth={2.5} strokeLinejoin="round" />
          {coords.map((c) => (
            <circle key={c.key} cx={c.x} cy={c.y} r={3} className="fill-cyan-600 dark:fill-cyan-400" />
          ))}
          <text x={CHART_LEFT} y={CHART_BOTTOM + 14} fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
            {points[0].label}
          </text>
          <text x={CHART_RIGHT} y={CHART_BOTTOM + 14} textAnchor="end" fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
            {points[points.length - 1].label}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
