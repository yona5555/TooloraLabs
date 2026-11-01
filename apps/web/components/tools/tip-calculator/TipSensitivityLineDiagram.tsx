"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useMeasuredWidth } from "@/components/tool-ui/useMeasuredWidth";
import { svgPx } from "@/components/tool-ui/svgPx";

type Point = { tipPercent: number; totalPerPerson: number };

type TipSensitivityLineDiagramProps = {
  points: Point[];
  currentTipPercent: number;
  caption: string;
  xLabel: string;
};

const HEIGHT = 160;
const MARGIN = { top: 14, right: 12, bottom: 26, left: 12 };
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

export default function TipSensitivityLineDiagram({ points, currentTipPercent, caption, xLabel }: TipSensitivityLineDiagramProps) {
  const [wrap, WIDTH] = useMeasuredWidth(320);
  const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
  const minPct = Math.min(...points.map((p) => p.tipPercent));
  const maxPct = Math.max(...points.map((p) => p.tipPercent));
  const minVal = Math.min(...points.map((p) => p.totalPerPerson));
  const maxVal = Math.max(...points.map((p) => p.totalPerPerson), minVal + 1);

  const xAt = (pct: number) => MARGIN.left + ((pct - minPct) / Math.max(maxPct - minPct, 1)) * PLOT_WIDTH;
  const yAt = (val: number) => MARGIN.top + PLOT_HEIGHT - ((val - minVal) / Math.max(maxVal - minVal, 1)) * PLOT_HEIGHT;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.tipPercent).toFixed(1)} ${yAt(p.totalPerPerson).toFixed(1)}`).join(" ");
  const currentX = xAt(currentTipPercent);
  const clampedCurrentPct = Math.min(Math.max(currentTipPercent, minPct), maxPct);
  const currentY = yAt(
    points.reduce((closest, p) => (Math.abs(p.tipPercent - clampedCurrentPct) < Math.abs(closest.tipPercent - clampedCurrentPct) ? p : closest), points[0])
      .totalPerPerson
  );

  return (
    <figure className="my-2">
      <div ref={wrap} dir="ltr" className="w-full overflow-x-auto">
        <FitSvg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} role="img" aria-label={caption} className="block h-auto w-full text-current" style={{ minWidth: 260 }}>
          <line x1={MARGIN.left} y1={MARGIN.top + PLOT_HEIGHT} x2={WIDTH - MARGIN.right} y2={MARGIN.top + PLOT_HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <path d={pathD} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
          <line x1={currentX} y1={MARGIN.top} x2={currentX} y2={MARGIN.top + PLOT_HEIGHT} strokeWidth={1} strokeDasharray="3 3" stroke="currentColor" opacity={0.4} />
          <circle cx={currentX} cy={currentY} r={4} className="fill-blue-600 dark:fill-blue-400" />
          <text style={{ fontSize: svgPx(12) }} x={MARGIN.left} y={HEIGHT - 6} fill="currentColor" opacity={0.6}>
            {minPct}%
          </text>
          <text style={{ fontSize: svgPx(12) }} x={WIDTH - MARGIN.right} y={HEIGHT - 6} textAnchor="end" fill="currentColor" opacity={0.6}>
            {maxPct}%
          </text>
          <text style={{ fontSize: svgPx(12) }} x={WIDTH / 2} y={HEIGHT - 6} textAnchor="middle" fill="currentColor" opacity={0.6}>
            {xLabel}
          </text>
        </FitSvg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
