type DiscountStackDiagramProps = {
  startLabel: string;
  afterFirstLabel: string;
  afterSecondLabel: string;
  caption: string;
};

const WIDTH = 320;
const BAR_HEIGHT = 26;
const ROW_GAP = 20;
const HEIGHT = BAR_HEIGHT * 3 + ROW_GAP * 2 + 4;

// Illustrative, not data-driven: 100 -> 70 (30% off) -> 63 (further 10% off).
const ROWS = [
  { width: WIDTH, fraction: 1 },
  { width: WIDTH * 0.7, fraction: 0.7 },
  { width: WIDTH * 0.63, fraction: 0.63 },
];

export default function DiscountStackDiagram({ startLabel, afterFirstLabel, afterSecondLabel, caption }: DiscountStackDiagramProps) {
  const labels = [startLabel, afterFirstLabel, afterSecondLabel];

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 280 }}>
          {ROWS.map((row, i) => {
            const y = i * (BAR_HEIGHT + ROW_GAP);
            return (
              <g key={i}>
                <rect x={0} y={y} width={WIDTH} height={BAR_HEIGHT} rx={4} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.3} />
                <rect x={0} y={y} width={row.width} height={BAR_HEIGHT} rx={4} fill="currentColor" opacity={0.15 + i * 0.25} />
                <text x={8} y={y + BAR_HEIGHT / 2 + 4} fontSize={11} fontWeight={700} fill="currentColor">
                  {labels[i]}
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
