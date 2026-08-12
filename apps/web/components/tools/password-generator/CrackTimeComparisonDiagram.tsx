type Row = { labelKey: string; log10Seconds: number };

// Illustrative, computed from this tool's own entropy formula at a fixed
// 100-billion-guesses/second offline attack rate — see the worked examples
// table for the exact bit counts each of these comes from.
const ROWS: Row[] = [
  { labelKey: "sevenLower", log10Seconds: 0 },
  { labelKey: "fourWords", log10Seconds: 1.57 },
  { labelKey: "eightMixed", log10Seconds: 3.04 },
  { labelKey: "sixWords", log10Seconds: 8.22 },
  { labelKey: "twelveMixed", log10Seconds: 12.5 },
];

type CrackTimeComparisonDiagramProps = {
  labels: Record<string, string>;
  caption: string;
};

const WIDTH = 520;
const ROW_H = 34;
const GAP = 10;
const LABEL_W = 190;
const CHART_W = WIDTH - LABEL_W - 20;
const MAX_LOG = 13;
const HEIGHT = ROWS.length * (ROW_H + GAP);

export default function CrackTimeComparisonDiagram({ labels, caption }: CrackTimeComparisonDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 440 }}>
          {ROWS.map((row, i) => {
            const y = i * (ROW_H + GAP);
            const barWidth = Math.max((row.log10Seconds / MAX_LOG) * CHART_W, 3);
            return (
              <g key={row.labelKey}>
                <text x={0} y={y + ROW_H / 2 + 4} fontSize={12} fill="currentColor">
                  {labels[row.labelKey]}
                </text>
                <rect x={LABEL_W} y={y} width={CHART_W} height={ROW_H} fill="currentColor" opacity={0.08} rx={4} />
                <rect x={LABEL_W} y={y} width={barWidth} height={ROW_H} fill="currentColor" opacity={0.75} rx={4} />
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
