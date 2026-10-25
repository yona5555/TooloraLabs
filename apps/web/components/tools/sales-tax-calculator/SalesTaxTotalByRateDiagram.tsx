"use client";
import { useMeasuredWidth } from "@/components/tool-ui/useMeasuredWidth";
import { svgPx } from "@/components/tool-ui/svgPx";

type Point = { rate: number; total: number };

type SalesTaxTotalByRateDiagramProps = {
  points: Point[];
  currentRate: number;
  caption: string;
  xLabel: string;
};

const HEIGHT = 160;
const MARGIN = { top: 14, right: 12, bottom: 26, left: 12 };
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

/**
 * Single continuous SVG line — a trend, not bordered boxes linked by
 * arrows, so it's outside the banned pattern (matches EduLineChart in
 * Fuel Cost Calculator, the reference tool's own line-chart convention).
 * Rebuilt fresh per the rm-all-indicators pass. `dir="ltr"`: a rising line
 * is a magnitude, same category as every other quantitative chart here.
 */
export default function SalesTaxTotalByRateDiagram({ points, currentRate, caption, xLabel }: SalesTaxTotalByRateDiagramProps) {
  const [wrap, WIDTH] = useMeasuredWidth(320);
  const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
  const minRate = Math.min(...points.map((p) => p.rate));
  const maxRate = Math.max(...points.map((p) => p.rate));
  const minTotal = Math.min(...points.map((p) => p.total));
  const maxTotal = Math.max(...points.map((p) => p.total), minTotal + 1);

  const xAt = (rate: number) => MARGIN.left + ((rate - minRate) / Math.max(maxRate - minRate, 1)) * PLOT_WIDTH;
  const yAt = (total: number) => MARGIN.top + PLOT_HEIGHT - ((total - minTotal) / Math.max(maxTotal - minTotal, 1)) * PLOT_HEIGHT;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.rate).toFixed(1)} ${yAt(p.total).toFixed(1)}`).join(" ");
  const clampedCurrent = Math.min(Math.max(currentRate, minRate), maxRate);
  const currentX = xAt(clampedCurrent);
  const nearest = points.reduce((closest, p) => (Math.abs(p.rate - clampedCurrent) < Math.abs(closest.rate - clampedCurrent) ? p : closest), points[0]);
  const currentY = yAt(nearest.total);

  return (
    <figure className="my-2">
      <div ref={wrap} dir="ltr" className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} role="img" aria-label={caption} className="block h-auto w-full text-current" style={{ minWidth: 260 }}>
          <line x1={MARGIN.left} y1={MARGIN.top + PLOT_HEIGHT} x2={WIDTH - MARGIN.right} y2={MARGIN.top + PLOT_HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <path d={pathD} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="stroke-amber-600 dark:stroke-amber-400" />
          <line x1={currentX} y1={MARGIN.top} x2={currentX} y2={MARGIN.top + PLOT_HEIGHT} strokeWidth={1} strokeDasharray="3 3" stroke="currentColor" opacity={0.4} />
          <circle cx={currentX} cy={currentY} r={4} className="fill-amber-600 dark:fill-amber-400" />
          <text style={{ fontSize: svgPx(12) }} x={MARGIN.left} y={HEIGHT - 6} fill="currentColor" opacity={0.6}>
            {minRate}%
          </text>
          <text style={{ fontSize: svgPx(12) }} x={WIDTH - MARGIN.right} y={HEIGHT - 6} textAnchor="end" fill="currentColor" opacity={0.6}>
            {maxRate}%
          </text>
          <text style={{ fontSize: svgPx(12) }} x={WIDTH / 2} y={HEIGHT - 6} textAnchor="middle" fill="currentColor" opacity={0.6}>
            {xLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
