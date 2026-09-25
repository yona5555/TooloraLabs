type PriceScenario = { key: string; label: string; units: number };

type BreakEvenPriceChangeImpactBarProps = {
  scenarios: PriceScenario[];
  /** Optional: omit when the caller renders its own caption below a wider layout (e.g. this chart sitting beside a worked-example note) instead of directly under the chart itself. */
  caption?: string;
  title: string;
};

const WIDTH = 260;
const HEIGHT = 150;
const CHART_TOP = 14;
const CHART_BOTTOM = HEIGHT - 34;
const CHART_H = CHART_BOTTOM - CHART_TOP;

export default function BreakEvenPriceChangeImpactBar({ scenarios, caption, title }: BreakEvenPriceChangeImpactBarProps) {
  const max = Math.max(...scenarios.map((s) => s.units), 1);
  const colW = WIDTH / scenarios.length;
  const barW = colW * 0.5;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 240 }}>
          <line x1={0} y1={CHART_BOTTOM} x2={WIDTH} y2={CHART_BOTTOM} stroke="currentColor" strokeWidth={1} opacity={0.25} />
          {scenarios.map((s, i) => {
            const x = i * colW + (colW - barW) / 2;
            const h = (s.units / max) * CHART_H;
            const y = CHART_BOTTOM - h;
            return (
              <g key={s.key}>
                <rect x={x} y={y} width={barW} height={h} rx={4} className="fill-amber-500 dark:fill-amber-400" />
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
                  {s.units}
                </text>
                <text x={x + barW / 2} y={CHART_BOTTOM + 14} textAnchor="middle" fontSize={8.5} className="fill-zinc-500 dark:fill-zinc-400">
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>}
    </figure>
  );
}
