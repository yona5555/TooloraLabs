type SeriesPoint = { unitsSold: number; value: number };

type InventoryMethodValueLineChartProps = {
  fifoSeries: SeriesPoint[];
  lifoSeries: SeriesPoint[];
  fifoLabel: string;
  lifoLabel: string;
  xLabel: string;
  title: string;
};

const WIDTH = 340;
const HEIGHT = 140;
const CHART_TOP = 16;
const CHART_BOTTOM = HEIGHT - 26;
const CHART_LEFT = 12;
const PLOT_RIGHT = WIDTH - 64;
const LABEL_X = PLOT_RIGHT + 8;

function buildPath(series: SeriesPoint[], maxUnits: number, maxValue: number) {
  return series
    .map((p, i) => {
      const x = CHART_LEFT + (p.unitsSold / maxUnits) * (PLOT_RIGHT - CHART_LEFT);
      const y = CHART_BOTTOM - (p.value / maxValue) * (CHART_BOTTOM - CHART_TOP);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

/**
 * Single continuous SVG line per method — a trend, not bordered boxes
 * linked by arrows (matches EduLineChart's convention). `dir="ltr"`:
 * a rising line is a magnitude, same category as every quantitative chart.
 */
export default function InventoryMethodValueLineChart({ fifoSeries, lifoSeries, fifoLabel, lifoLabel, xLabel, title }: InventoryMethodValueLineChartProps) {
  const maxUnits = Math.max(...fifoSeries.map((p) => p.unitsSold));
  const maxValue = Math.max(...fifoSeries.map((p) => p.value), ...lifoSeries.map((p) => p.value)) * 1.1;
  const fifoEndY = CHART_BOTTOM - (fifoSeries[fifoSeries.length - 1].value / maxValue) * (CHART_BOTTOM - CHART_TOP);
  const lifoEndY = CHART_BOTTOM - (lifoSeries[lifoSeries.length - 1].value / maxValue) * (CHART_BOTTOM - CHART_TOP);
  const labelsClose = Math.abs(fifoEndY - lifoEndY) < 14;

  return (
    <div dir="ltr" className="overflow-x-auto">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 300 }}>
        <line x1={CHART_LEFT} y1={CHART_BOTTOM} x2={PLOT_RIGHT} y2={CHART_BOTTOM} stroke="currentColor" strokeWidth={1} opacity={0.2} />
        <path d={buildPath(fifoSeries, maxUnits, maxValue)} fill="none" className="stroke-indigo-500 dark:stroke-indigo-400" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={buildPath(lifoSeries, maxUnits, maxValue)} fill="none" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        <text x={LABEL_X} y={fifoEndY + (labelsClose ? -5 : 4)} textAnchor="start" fontSize={9} fontWeight={700} className="fill-indigo-600 dark:fill-indigo-400">
          {fifoLabel}: ${fifoSeries[fifoSeries.length - 1].value}
        </text>
        <text x={LABEL_X} y={lifoEndY + (labelsClose ? 9 : 4)} textAnchor="start" fontSize={9} fontWeight={700} className="fill-amber-600 dark:fill-amber-400">
          {lifoLabel}: ${lifoSeries[lifoSeries.length - 1].value}
        </text>
        <text x={CHART_LEFT} y={HEIGHT - 6} textAnchor="start" fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
          {xLabel}
        </text>
      </svg>
    </div>
  );
}
