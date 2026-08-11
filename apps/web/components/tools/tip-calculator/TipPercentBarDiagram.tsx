type TipPercentBarDiagramProps = {
  bars: { label: string; value: number }[];
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 160;
const MARGIN_BOTTOM = 24;
const MARGIN_TOP = 10;
const PLOT_HEIGHT = HEIGHT - MARGIN_BOTTOM - MARGIN_TOP;
const BAR_GAP = 18;

export default function TipPercentBarDiagram({ bars, caption }: TipPercentBarDiagramProps) {
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
                <rect x={x} y={y} width={barWidth} height={barHeight} fill="currentColor" opacity={0.75} />
                <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
                  {bar.value}
                </text>
                <text x={x + barWidth / 2} y={MARGIN_TOP + PLOT_HEIGHT + 16} textAnchor="middle" fontSize={11} fill="currentColor">
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
