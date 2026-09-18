type SeriesPoint = { unitsSold: number; value: number };

type InventoryMethodValueLineChartProps = {
  fifoSeries: SeriesPoint[];
  lifoSeries: SeriesPoint[];
  fifoLabel: string;
  lifoLabel: string;
  xLabel: string;
  caption: string;
  title: string;
};

const WIDTH = 300;
const HEIGHT = 140;
const CHART_TOP = 16;
const CHART_BOTTOM = HEIGHT - 26;
const CHART_LEFT = 12;
const CHART_RIGHT = WIDTH - 12;

function buildPath(series: SeriesPoint[], maxUnits: number, maxValue: number) {
  return series
    .map((p, i) => {
      const x = CHART_LEFT + (p.unitsSold / maxUnits) * (CHART_RIGHT - CHART_LEFT);
      const y = CHART_BOTTOM - (p.value / maxValue) * (CHART_BOTTOM - CHART_TOP);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function InventoryMethodValueLineChart({ fifoSeries, lifoSeries, fifoLabel, lifoLabel, xLabel, caption, title }: InventoryMethodValueLineChartProps) {
  const maxUnits = Math.max(...fifoSeries.map((p) => p.unitsSold));
  const maxValue = Math.max(...fifoSeries.map((p) => p.value), ...lifoSeries.map((p) => p.value)) * 1.1;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 280 }}>
          <line x1={CHART_LEFT} y1={CHART_BOTTOM} x2={CHART_RIGHT} y2={CHART_BOTTOM} stroke="currentColor" strokeWidth={1} opacity={0.2} />
          <path d={buildPath(fifoSeries, maxUnits, maxValue)} fill="none" className="stroke-indigo-500 dark:stroke-indigo-400" strokeWidth={2.5} strokeLinejoin="round" />
          <path d={buildPath(lifoSeries, maxUnits, maxValue)} fill="none" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth={2.5} strokeLinejoin="round" />

          <text x={CHART_RIGHT} y={CHART_BOTTOM - (fifoSeries[fifoSeries.length - 1].value / maxValue) * (CHART_BOTTOM - CHART_TOP) - 6} textAnchor="end" fontSize={9} fontWeight={700} className="fill-indigo-600 dark:fill-indigo-400">
            {fifoLabel}: ${fifoSeries[fifoSeries.length - 1].value}
          </text>
          <text x={CHART_RIGHT} y={CHART_BOTTOM - (lifoSeries[lifoSeries.length - 1].value / maxValue) * (CHART_BOTTOM - CHART_TOP) + 14} textAnchor="end" fontSize={9} fontWeight={700} className="fill-amber-600 dark:fill-amber-400">
            {lifoLabel}: ${lifoSeries[lifoSeries.length - 1].value}
          </text>
          <text x={CHART_LEFT} y={HEIGHT - 6} textAnchor="start" fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
            {xLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
