import { svgPx } from "@/components/tool-ui/svgPx";
import { labelW } from "@/components/tool-ui/labelLayout";
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

function buildPath(series: SeriesPoint[], maxUnits: number, maxValue: number, PLOT_RIGHT: number) {
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
  const labelsClose = Math.abs(fifoEndY - lifoEndY) < 16;
  const fifoText = `${fifoLabel}: $${fifoSeries[fifoSeries.length - 1].value}`;
  const lifoText = `${lifoLabel}: $${lifoSeries[lifoSeries.length - 1].value}`;
  // the end labels keep their room right of the plot, also at the up-to-1.15× a phone draws them in
  // chart units (svgPx), so they never run off the right edge (§39)
  const PLOT_RIGHT = WIDTH - 12 - Math.max(labelW(fifoText), labelW(lifoText)) * 1.15;
  const LABEL_X = PLOT_RIGHT + 8;

  return (
    <div dir="ltr" className="overflow-x-auto">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 300 }}>
        <line x1={CHART_LEFT} y1={CHART_BOTTOM} x2={PLOT_RIGHT} y2={CHART_BOTTOM} stroke="currentColor" strokeWidth={1} opacity={0.2} />
        <path d={buildPath(fifoSeries, maxUnits, maxValue, PLOT_RIGHT)} fill="none" className="stroke-indigo-500 dark:stroke-indigo-400" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={buildPath(lifoSeries, maxUnits, maxValue, PLOT_RIGHT)} fill="none" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        <text style={{ fontSize: svgPx(12) }} x={LABEL_X} y={fifoEndY + (labelsClose ? -6 : 4)} textAnchor="start" fontWeight={700} className="fill-indigo-600 dark:fill-indigo-400">
          {fifoText}
        </text>
        <text style={{ fontSize: svgPx(12) }} x={LABEL_X} y={lifoEndY + (labelsClose ? 10 : 4)} textAnchor="start" fontWeight={700} className="fill-amber-600 dark:fill-amber-400">
          {lifoText}
        </text>
        <text style={{ fontSize: svgPx(12) }} x={CHART_LEFT} y={HEIGHT - 6} textAnchor="start" className="fill-zinc-500 dark:fill-zinc-400">
          {xLabel}
        </text>
      </svg>
    </div>
  );
}
