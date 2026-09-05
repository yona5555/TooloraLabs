type SalesTaxRateComparisonBarDiagramProps = {
  bars: { label: string; value: number; highlighted?: boolean }[];
  formatValue: (value: number) => string;
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 170;
const MARGIN_BOTTOM = 30;
const MARGIN_TOP = 12;
const PLOT_HEIGHT = HEIGHT - MARGIN_BOTTOM - MARGIN_TOP;
const BAR_GAP = 16;

export default function SalesTaxRateComparisonBarDiagram({ bars, formatValue, caption }: SalesTaxRateComparisonBarDiagramProps) {
  const maxValue = Math.max(...bars.map((b) => b.value), 1);
  const barWidth = (WIDTH - BAR_GAP * (bars.length + 1)) / bars.length;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-72 text-current" style={{ minWidth: 260 }}>
          <line x1={0} y1={MARGIN_TOP + PLOT_HEIGHT} x2={WIDTH} y2={MARGIN_TOP + PLOT_HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.4} />
          {bars.map((bar, i) => {
            const barHeight = (bar.value / maxValue) * PLOT_HEIGHT;
            const x = BAR_GAP + i * (barWidth + BAR_GAP);
            const y = MARGIN_TOP + PLOT_HEIGHT - barHeight;
            return (
              <g key={bar.label}>
                <rect x={x} y={y} width={barWidth} height={barHeight} rx={3} className={bar.highlighted ? "fill-blue-600 dark:fill-blue-400" : "fill-current"} opacity={bar.highlighted ? 1 : 0.4} />
                <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="currentColor">
                  {formatValue(bar.value)}
                </text>
                <text x={x + barWidth / 2} y={MARGIN_TOP + PLOT_HEIGHT + 16} textAnchor="middle" fontSize={10} fill="currentColor">
                  {bar.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
