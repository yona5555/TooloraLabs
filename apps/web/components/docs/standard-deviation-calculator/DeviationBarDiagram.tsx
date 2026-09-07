type DeviationBarDiagramProps = {
  rows: { label: string; value: number; deviation: number }[];
  meanLabel: string;
  caption: string;
};

const WIDTH = 320;
const ROW_HEIGHT = 24;
const ROW_GAP = 10;
const CENTER_X = WIDTH / 2;

export default function DeviationBarDiagram({ rows, meanLabel, caption }: DeviationBarDiagramProps) {
  const maxAbsDeviation = Math.max(...rows.map((r) => Math.abs(r.deviation)), 1);
  const halfWidth = WIDTH / 2 - 40;
  const height = rows.length * (ROW_HEIGHT + ROW_GAP) - ROW_GAP + 20;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 280 }}>
          <line x1={CENTER_X} y1={16} x2={CENTER_X} y2={height} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          <text x={CENTER_X} y={10} textAnchor="middle" fontSize={9} fontWeight={700} fill="currentColor" opacity={0.6}>
            {meanLabel}
          </text>
          {rows.map((row, i) => {
            const y = 20 + i * (ROW_HEIGHT + ROW_GAP);
            const barWidth = (Math.abs(row.deviation) / maxAbsDeviation) * halfWidth;
            const isPositive = row.deviation >= 0;
            const x = isPositive ? CENTER_X : CENTER_X - barWidth;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barWidth} height={ROW_HEIGHT} rx={3} className={isPositive ? "fill-blue-600 dark:fill-blue-400" : "fill-amber-500 dark:fill-amber-400"} />
                <text
                  x={isPositive ? x + barWidth + 6 : x - 6}
                  y={y + ROW_HEIGHT / 2 + 4}
                  textAnchor={isPositive ? "start" : "end"}
                  fontSize={10}
                  fontWeight={700}
                  fill="currentColor"
                >
                  {row.label}
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
