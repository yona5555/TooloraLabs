import { svgPx } from "@/components/tool-ui/svgPx";
import { labelW, staggerRows } from "@/components/tool-ui/labelLayout";
/**
 * Lightweight, non-interactive SVG line chart shared by this tool's education-page
 * diagrams, for continuous/trend relationships where a line reads better than bars
 * (cost accumulating over time, cost decreasing as efficiency rises, etc). Pure
 * presentational (no "use client", no hooks) so it costs zero client JS.
 */
type Point = { x: number; label: string; value: number; formatted: string };

type Props = {
  points: Point[];
  ariaLabel: string;
  lineColorClass?: string;
  dotColorClass?: string;
};

const WIDTH = 340;
const HEIGHT0 = 170;
const PAD_LEFT = 44;
const PAD_RIGHT = 16;
// room above the highest point for its 12px value label
const PAD_TOP = 24;
const PAD_BOTTOM = 32;

export default function EduLineChart({ points, ariaLabel, lineColorClass = "stroke-violet-500 dark:stroke-violet-400", dotColorClass = "fill-violet-500 dark:fill-violet-400" }: Props) {
  const values = points.map((p) => p.value);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 1);
  const range = Math.max(maxValue - minValue, 1);
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const xRange = Math.max(maxX - minX, 1);
  // x labels that would touch drop to a second row; the chart grows by that row (§39)
  const xPos = (x: number) => PAD_LEFT + ((x - minX) / xRange) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const anchorOf = (i: number) => (i === 0 ? "start" : i === points.length - 1 ? "end" : "middle");
  const xRow = staggerRows(
    points.map((p, i) => {
      const w = labelW(p.label);
      const a = anchorOf(i);
      return { x: a === "start" ? xPos(p.x) + w / 2 : a === "end" ? xPos(p.x) - w / 2 : xPos(p.x), w };
    }),
  );
  const HEIGHT = HEIGHT0 + (xRow.some((r) => r) ? 14 : 0);
  const PAD_B = PAD_BOTTOM + (xRow.some((r) => r) ? 14 : 0);

  const xFor = xPos;
  const yFor = (v: number) => HEIGHT - PAD_B - ((v - minValue) / range) * (HEIGHT - PAD_TOP - PAD_B);

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.x).toFixed(1)} ${yFor(p.value).toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${xFor(points[points.length - 1].x).toFixed(1)} ${HEIGHT - PAD_B} L ${xFor(points[0].x).toFixed(1)} ${HEIGHT - PAD_B} Z`;

  return (
    <div dir="ltr" className="overflow-x-auto">
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={ariaLabel} className="block min-w-[300px] text-current">
        <line x1={PAD_LEFT} y1={HEIGHT - PAD_B} x2={WIDTH - PAD_RIGHT} y2={HEIGHT - PAD_B} className="stroke-current opacity-20" strokeWidth={1} />
        <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={HEIGHT - PAD_B} className="stroke-current opacity-20" strokeWidth={1} />
        <path d={areaD} className={`${dotColorClass} opacity-[0.08]`} stroke="none" />
        <path d={pathD} fill="none" className={lineColorClass} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => {
          const anchor = anchorOf(i);
          return (
            <g key={p.label}>
              <circle cx={xFor(p.x)} cy={yFor(p.value)} r={4} className={dotColorClass} />
              <text style={{ fontSize: svgPx(12) }} x={xFor(p.x)} y={HEIGHT - PAD_B + 16 + xRow[i] * 14} textAnchor={anchor} fill="currentColor" opacity={0.7}>
                {p.label}
              </text>
              <text style={{ fontSize: svgPx(12) }} x={xFor(p.x)} y={yFor(p.value) - 10} textAnchor={anchor} fontWeight={700} fill="currentColor">
                {p.formatted}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
