type InvoiceUblAdoptionDiagramProps = {
  regions: string[];
  mandatedLabel: string;
  caption: string;
};

const WIDTH = 300;

export default function InvoiceUblAdoptionDiagram({ regions, mandatedLabel, caption }: InvoiceUblAdoptionDiagramProps) {
  const chipW = 54;
  const chipH = 24;
  const gap = 6;
  const perRow = 4;
  const rows = Math.ceil(regions.length / perRow);
  const rowW = perRow * chipW + (perRow - 1) * gap;
  const startX = (WIDTH - rowW) / 2;
  const height = 24 + rows * (chipH + gap);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={mandatedLabel} className="h-auto w-full" style={{ minWidth: 280 }}>
          <text x={WIDTH / 2} y={12} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-cyan-600 dark:fill-cyan-400">
            {mandatedLabel}
          </text>
          {regions.map((region, i) => {
            const row = Math.floor(i / perRow);
            const col = i % perRow;
            const x = startX + col * (chipW + gap);
            const y = 22 + row * (chipH + gap);
            return (
              <g key={region}>
                <rect x={x} y={y} width={chipW} height={chipH} rx={12} className="fill-cyan-50 stroke-cyan-500 dark:fill-cyan-500/10 dark:stroke-cyan-400" strokeWidth={1.5} />
                <text x={x + chipW / 2} y={y + chipH / 2 + 4} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-cyan-700 dark:fill-cyan-300">
                  {region}
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
