type ValueComparisonBarDiagramProps = {
  bars: { label: string; value: number; colorClass: string }[];
  caption: string;
};

const WIDTH = 320;
const ROW_HEIGHT = 28;
const ROW_GAP = 14;
const LABEL_WIDTH = 70;

export default function ValueComparisonBarDiagram({ bars, caption }: ValueComparisonBarDiagramProps) {
  const maxValue = Math.max(...bars.map((b) => b.value), 1);
  const height = bars.length * (ROW_HEIGHT + ROW_GAP) - ROW_GAP;
  const barMaxWidth = WIDTH - LABEL_WIDTH - 8;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 280 }}>
          {bars.map((bar, i) => {
            const y = i * (ROW_HEIGHT + ROW_GAP);
            const width = Math.max((bar.value / maxValue) * barMaxWidth, 2);
            return (
              <g key={bar.label}>
                <text x={LABEL_WIDTH - 8} y={y + ROW_HEIGHT / 2 + 4} textAnchor="end" fontSize={11} fill="currentColor">
                  {bar.label}
                </text>
                <rect x={LABEL_WIDTH} y={y} width={width} height={ROW_HEIGHT} rx={4} className={bar.colorClass} />
                <text x={LABEL_WIDTH + width + 6} y={y + ROW_HEIGHT / 2 + 4} fontSize={11} fontWeight={700} fill="currentColor">
                  {bar.value}
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
