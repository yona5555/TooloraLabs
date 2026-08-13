type DedupeDiagramProps = {
  inputLabel: string;
  hashSetLabel: string;
  outputLabel: string;
  caption: string;
};

const WIDTH = 480;
const ROW_H = 26;
const COL1_X = 30;
const COL2_X = 200;
const COL3_X = 370;
const COL_W = 90;
const START_Y = 20;

const LINES = ["apple", "banana", "apple", "cherry", "banana"];

export default function DedupeDiagram({ inputLabel, hashSetLabel, outputLabel, caption }: DedupeDiagramProps) {
  const height = START_Y + LINES.length * ROW_H + 20;
  const seen = new Set<string>();
  const kept: { line: string; row: number }[] = [];

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 420 }}>
          <text x={COL1_X} y={14} fontSize={10} fontWeight={700} fill="currentColor" opacity={0.7}>
            {inputLabel}
          </text>
          <text x={COL2_X} y={14} fontSize={10} fontWeight={700} fill="currentColor" opacity={0.7}>
            {hashSetLabel}
          </text>
          <text x={COL3_X} y={14} fontSize={10} fontWeight={700} fill="currentColor" opacity={0.7}>
            {outputLabel}
          </text>

          {LINES.map((line, i) => {
            const y = START_Y + i * ROW_H;
            const isDup = seen.has(line);
            if (!isDup) {
              seen.add(line);
              kept.push({ line, row: i });
            }
            return (
              <g key={i}>
                <rect x={COL1_X} y={y} width={COL_W} height={ROW_H - 6} rx={4} fill="currentColor" opacity={isDup ? 0.06 : 0.14} />
                <text x={COL1_X + 8} y={y + (ROW_H - 6) / 2 + 4} fontSize={10.5} fill="currentColor" opacity={isDup ? 0.4 : 1} style={isDup ? { textDecoration: "line-through" } : undefined}>
                  {line}
                </text>
                <line
                  x1={COL1_X + COL_W}
                  y1={y + (ROW_H - 6) / 2}
                  x2={COL2_X - 6}
                  y2={y + (ROW_H - 6) / 2}
                  stroke="currentColor"
                  strokeWidth={1}
                  opacity={isDup ? 0.15 : 0.4}
                  strokeDasharray={isDup ? "2 2" : undefined}
                />
              </g>
            );
          })}

          <rect x={COL2_X} y={START_Y} width={COL_W} height={LINES.length * ROW_H - 6} rx={6} fill="currentColor" opacity={0.08} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" />
          <text x={COL2_X + COL_W / 2} y={START_Y + (LINES.length * ROW_H - 6) / 2} textAnchor="middle" fontSize={9.5} fill="currentColor" opacity={0.6}>
            {"{ }"}
          </text>

          {kept.map(({ line, row }, i) => {
            const fromY = START_Y + row * ROW_H + (ROW_H - 6) / 2;
            const toY = START_Y + i * ROW_H + (ROW_H - 6) / 2;
            return (
              <g key={line}>
                <line x1={COL2_X + COL_W} y1={fromY} x2={COL3_X - 6} y2={toY} stroke="currentColor" strokeWidth={1} opacity={0.5} />
                <rect x={COL3_X} y={toY - (ROW_H - 6) / 2} width={COL_W} height={ROW_H - 6} rx={4} fill="currentColor" opacity={0.85} />
                <text x={COL3_X + 8} y={toY + 4} fontSize={10.5} fill="var(--bg,#faf7ef)">
                  {line}
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
