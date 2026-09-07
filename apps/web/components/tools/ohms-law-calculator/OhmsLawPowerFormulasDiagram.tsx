type OhmsLawPowerFormulasDiagramProps = {
  viText: string;
  i2rText: string;
  v2rText: string;
  powerText: string;
  caption: string;
};

/**
 * Structural view of the result: the same power value, arrived at three
 * mathematically equivalent ways (P = VI = I^2R = V^2/R), converging on one
 * box. Purely illustrative of the algebraic identity, not a live plot.
 */
export default function OhmsLawPowerFormulasDiagram({ viText, i2rText, v2rText, powerText, caption }: OhmsLawPowerFormulasDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 320 130" role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          {[
            { y: 12, text: viText },
            { y: 55, text: i2rText },
            { y: 98, text: v2rText },
          ].map((row) => (
            <g key={row.text}>
              <rect x={4} y={row.y} width={110} height={26} rx={6} className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-800 dark:stroke-zinc-600" strokeWidth={1.2} />
              <text x={59} y={row.y + 17} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
                {row.text}
              </text>
              <line x1={114} y1={row.y + 13} x2={190} y2={68} stroke="currentColor" strokeWidth={1} opacity={0.4} />
            </g>
          ))}

          <rect x={194} y={48} width={110} height={40} rx={8} className="fill-blue-600/15 stroke-blue-600 dark:fill-blue-400/15 dark:stroke-blue-400" strokeWidth={1.5} />
          <text x={249} y={73} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {powerText}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
