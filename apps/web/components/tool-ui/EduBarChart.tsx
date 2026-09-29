/**
 * Lightweight, non-interactive SVG horizontal bar chart (§31 type #1/#5) for an education-page
 * diagram. Pure presentational (no "use client", no hooks) so it costs zero client JS. Shared
 * across tools going forward — matches the per-tool copies already in triangle-calculator's and
 * fuel-cost-calculator's own `EduBarChart.tsx` exactly; those predate this shared version and
 * are left as-is, but new tools should import this one instead of adding another copy.
 */
type Bar = { label: string; value: number; formatted: string; highlight?: boolean };

type Props = {
  bars: Bar[];
  ariaLabel: string;
  barColorClass?: string;
  highlightColorClass?: string;
};

const ROW_HEIGHT = 30;
const ROW_GAP = 10;
const VALUE_WIDTH = 78;
const MARGIN = { top: 8, bottom: 8 };
const CHAR_WIDTH = 6.3;
const MIN_LABEL_WIDTH = 90;
const MIN_PLOT_WIDTH = 150;

export default function EduBarChart({ bars, ariaLabel, barColorClass = "fill-blue-500/80 dark:fill-blue-400/80", highlightColorClass = "fill-amber-500 dark:fill-amber-400" }: Props) {
  const maxValue = Math.max(...bars.map((b) => b.value), 1);
  const longestLabel = Math.max(...bars.map((b) => b.label.length));
  const labelWidth = Math.max(MIN_LABEL_WIDTH, Math.ceil(longestLabel * CHAR_WIDTH) + 8);
  const plotWidth = MIN_PLOT_WIDTH;
  const width = labelWidth + plotWidth + VALUE_WIDTH + 16;
  const height = MARGIN.top + MARGIN.bottom + bars.length * ROW_HEIGHT + (bars.length - 1) * ROW_GAP;

  return (
    <div dir="ltr" className="overflow-x-auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} className="block min-w-[320px] text-current">
        {bars.map((bar, i) => {
          const y = MARGIN.top + i * (ROW_HEIGHT + ROW_GAP);
          const barW = Math.max((bar.value / maxValue) * plotWidth, 2);
          return (
            <g key={bar.label}>
              <text x={labelWidth - 8} y={y + ROW_HEIGHT / 2 + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.75}>
                {bar.label}
              </text>
              <rect x={labelWidth} y={y} width={plotWidth} height={ROW_HEIGHT} rx={4} className="fill-current opacity-[0.06]" />
              <rect x={labelWidth} y={y} width={barW} height={ROW_HEIGHT} rx={4} className={bar.highlight ? highlightColorClass : barColorClass} />
              <text x={labelWidth + plotWidth + 10} y={y + ROW_HEIGHT / 2 + 4} textAnchor="start" fontSize={11} fontWeight={700} fill="currentColor">
                {bar.formatted}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
