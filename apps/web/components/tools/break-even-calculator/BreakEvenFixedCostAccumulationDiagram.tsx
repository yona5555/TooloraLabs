type Point = { units: number; cumulative: number };

type BreakEvenFixedCostAccumulationDiagramProps = {
  fixedCostLabel: string;
  breakEvenLabel: string;
  caption: string;
  title: string;
};

const WIDTH = 380;
const HEIGHT = 140;
const CHART_TOP = 16;
const CHART_BOTTOM = HEIGHT - 26;
const CHART_LEFT = 12;
// The plotted line and its dots stop here, short of the SVG's own right edge,
// so the break-even label never lands on top of (and gets camouflaged by)
// the last data point's dot marker. The remaining width (WIDTH - PLOT_RIGHT)
// must comfortably fit the full "<label>: 334" text at fontSize 8.5.
const PLOT_RIGHT = WIDTH - 100;
const LABEL_X = PLOT_RIGHT + 8;
const FIXED_COST = 10000;
const MARGIN_PER_UNIT = 30;
const BREAK_EVEN_UNITS = 334;

const POINTS: Point[] = [0, 100, 200, 334].map((units) => ({ units, cumulative: units * MARGIN_PER_UNIT }));

export default function BreakEvenFixedCostAccumulationDiagram({ fixedCostLabel, breakEvenLabel, caption, title }: BreakEvenFixedCostAccumulationDiagramProps) {
  const maxUnits = BREAK_EVEN_UNITS;
  const maxValue = FIXED_COST * 1.05;

  const path = POINTS.map((p, i) => {
    const x = CHART_LEFT + (p.units / maxUnits) * (PLOT_RIGHT - CHART_LEFT);
    const y = CHART_BOTTOM - (p.cumulative / maxValue) * (CHART_BOTTOM - CHART_TOP);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const fixedCostY = CHART_BOTTOM - (FIXED_COST / maxValue) * (CHART_BOTTOM - CHART_TOP);
  const lastPointY = CHART_BOTTOM - (POINTS[POINTS.length - 1].cumulative / maxValue) * (CHART_BOTTOM - CHART_TOP);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 300 }}>
          <line x1={CHART_LEFT} y1={fixedCostY} x2={PLOT_RIGHT} y2={fixedCostY} className="stroke-rose-400 dark:stroke-rose-400/70" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={CHART_LEFT} y={fixedCostY - 4} textAnchor="start" fontSize={8.5} fontWeight={700} className="fill-rose-600 dark:fill-rose-400">
            {fixedCostLabel}: ${FIXED_COST.toLocaleString("en-US")}
          </text>
          <path d={path} fill="none" className="stroke-indigo-500 dark:stroke-indigo-400" strokeWidth={2.5} strokeLinejoin="round" />
          {POINTS.map((p) => {
            const x = CHART_LEFT + (p.units / maxUnits) * (PLOT_RIGHT - CHART_LEFT);
            const y = CHART_BOTTOM - (p.cumulative / maxValue) * (CHART_BOTTOM - CHART_TOP);
            return <circle key={p.units} cx={x} cy={y} r={3.5} className="fill-indigo-600 dark:fill-indigo-400" />;
          })}
          <text x={LABEL_X} y={lastPointY + 4} textAnchor="start" fontSize={8.5} fontWeight={700} className="fill-indigo-700 dark:fill-indigo-300">
            {breakEvenLabel}: 334
          </text>
          <line x1={CHART_LEFT} y1={CHART_BOTTOM} x2={PLOT_RIGHT} y2={CHART_BOTTOM} stroke="currentColor" strokeWidth={1} opacity={0.2} />
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
