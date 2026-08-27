type MagnitudeScaleDiagramProps = {
  logPosition: number;
  caption: string;
};

const MIN_EXP = -15;
const MAX_EXP = 15;
const WIDTH = 340;
const MARGIN = 18;
const AXIS_WIDTH = WIDTH - MARGIN * 2;
const HEIGHT = 70;
const AXIS_Y = 24;
const TICKS = [-15, -12, -9, -6, -3, 0, 3, 6, 9, 12, 15];

function xForExponent(exp: number): number {
  const clamped = Math.min(MAX_EXP, Math.max(MIN_EXP, exp));
  return MARGIN + ((clamped - MIN_EXP) / (MAX_EXP - MIN_EXP)) * AXIS_WIDTH;
}

/**
 * A real, mathematically precise position on a logarithmic magnitude scale —
 * the marker's x-coordinate is computed directly from log10(|value|), not a
 * decorative illustration, so it moves to the exact spot for every result.
 */
export default function MagnitudeScaleDiagram({ logPosition, caption }: MagnitudeScaleDiagramProps) {
  const markerX = xForExponent(logPosition);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <line x1={MARGIN} y1={AXIS_Y} x2={WIDTH - MARGIN} y2={AXIS_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          {TICKS.map((exp) => {
            const x = xForExponent(exp);
            return (
              <g key={exp}>
                <line x1={x} y1={AXIS_Y - 5} x2={x} y2={AXIS_Y + 5} stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
                <text x={x} y={AXIS_Y + 20} fontSize={9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
                  10^{exp}
                </text>
              </g>
            );
          })}
          <circle cx={markerX} cy={AXIS_Y} r={6} fill="currentColor" className="text-blue-600 dark:text-blue-400" />
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
