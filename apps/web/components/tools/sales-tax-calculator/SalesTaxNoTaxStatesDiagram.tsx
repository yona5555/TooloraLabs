type SalesTaxNoTaxStatesDiagramProps = {
  states: string[];
  noTaxLabel: string;
  typicalLabel: string;
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 108;

export default function SalesTaxNoTaxStatesDiagram({ states, noTaxLabel, typicalLabel, caption }: SalesTaxNoTaxStatesDiagramProps) {
  const chipW = 60;
  const chipH = 26;
  const gap = 6;
  const startX = (WIDTH - (states.length * chipW + (states.length - 1) * gap)) / 2;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={noTaxLabel} className="h-auto w-full" style={{ minWidth: 300 }}>
          <text x={WIDTH / 2} y={14} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-cyan-600 dark:fill-cyan-400">
            {noTaxLabel} — 0%
          </text>
          {states.map((state, i) => {
            const x = startX + i * (chipW + gap);
            return (
              <g key={state}>
                <rect x={x} y={22} width={chipW} height={chipH} rx={13} className="fill-cyan-50 stroke-cyan-500 dark:fill-cyan-500/10 dark:stroke-cyan-400" strokeWidth={1.5} />
                <text x={x + chipW / 2} y={22 + chipH / 2 + 4} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-cyan-700 dark:fill-cyan-300">
                  {state}
                </text>
              </g>
            );
          })}

          <line x1={16} y1={64} x2={WIDTH - 16} y2={64} stroke="currentColor" strokeWidth={1} opacity={0.2} />
          <circle cx={16} cy={64} r={3} className="fill-cyan-500 dark:fill-cyan-400" />
          <circle cx={WIDTH - 16} cy={64} r={3} className="fill-amber-500 dark:fill-amber-400" />
          <text x={16} y={80} textAnchor="start" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            0%
          </text>
          <text x={WIDTH - 16} y={80} textAnchor="end" fontSize={9} fontWeight={700} className="fill-amber-600 dark:fill-amber-400">
            {typicalLabel} 7–10%
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
