type UnitDivergenceDiagramProps = {
  chartLabel: string;
  caption: string;
};

const WIDTH = 420;
const BAR_HEIGHT = 22;
const GAP = 8;
const PAD = 6;
const LABEL_W = 50;

const ROWS = [
  { label: "KB / KiB", percent: (1024 / 1000 - 1) * 100 },
  { label: "MB / MiB", percent: (Math.pow(1024, 2) / Math.pow(1000, 2) - 1) * 100 },
  { label: "GB / GiB", percent: (Math.pow(1024, 3) / Math.pow(1000, 3) - 1) * 100 },
  { label: "TB / TiB", percent: (Math.pow(1024, 4) / Math.pow(1000, 4) - 1) * 100 },
  { label: "PB / PiB", percent: (Math.pow(1024, 5) / Math.pow(1000, 5) - 1) * 100 },
];

export default function UnitDivergenceDiagram({ chartLabel, caption }: UnitDivergenceDiagramProps) {
  const max = Math.max(...ROWS.map((r) => r.percent));
  const barAreaW = WIDTH - LABEL_W - PAD * 2;
  const height = PAD * 2 + ROWS.length * (BAR_HEIGHT + GAP) - GAP;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={chartLabel} className="h-auto w-full text-current" style={{ minWidth: 340 }}>
          {ROWS.map((row, i) => {
            const y = PAD + i * (BAR_HEIGHT + GAP);
            const w = (row.percent / max) * barAreaW;
            return (
              <g key={row.label}>
                <text x={0} y={y + BAR_HEIGHT / 2 + 4} fontSize={11} fill="currentColor">
                  {row.label}
                </text>
                <rect x={LABEL_W} y={y} width={barAreaW} height={BAR_HEIGHT} fill="currentColor" opacity={0.08} rx={4} />
                <rect x={LABEL_W} y={y} width={w} height={BAR_HEIGHT} fill="currentColor" opacity={0.75} rx={4} />
                <text
                  x={LABEL_W + barAreaW - 4}
                  y={y + BAR_HEIGHT / 2 + 4}
                  textAnchor="end"
                  fontSize={11}
                  fontWeight={700}
                  fill="currentColor"
                  style={{ unicodeBidi: "bidi-override", direction: "ltr" }}
                >
                  +{row.percent.toFixed(1)}%
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
