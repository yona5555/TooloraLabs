type PhScaleDiagramProps = {
  pH: number;
  caption: string;
};

const MIN = 0;
const MAX = 14;
const WIDTH = 340;
const MARGIN = 18;
const AXIS_WIDTH = WIDTH - MARGIN * 2;
const HEIGHT = 60;
const AXIS_Y = 26;
const TICKS = [0, 2, 4, 6, 7, 8, 10, 12, 14];

function xForPh(value: number): number {
  const clamped = Math.min(MAX, Math.max(MIN, value));
  return MARGIN + ((clamped - MIN) / (MAX - MIN)) * AXIS_WIDTH;
}

/**
 * A real, precisely computed marker position on the 0-14 pH scale — driven
 * directly by the actual calculated pH, not a decorative illustration. The
 * acidic (red) / basic (blue) bands split exactly at neutral pH 7.
 */
export default function PhScaleDiagram({ pH, caption }: PhScaleDiagramProps) {
  const markerX = xForPh(pH);
  const neutralX = xForPh(7);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <rect x={MARGIN} y={AXIS_Y - 4} width={neutralX - MARGIN} height={8} fill="#ef4444" opacity={0.25} rx={2} />
          <rect x={neutralX} y={AXIS_Y - 4} width={WIDTH - MARGIN - neutralX} height={8} fill="#3b82f6" opacity={0.25} rx={2} />
          <line x1={MARGIN} y1={AXIS_Y} x2={WIDTH - MARGIN} y2={AXIS_Y} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          {TICKS.map((tick) => {
            const x = xForPh(tick);
            return (
              <g key={tick}>
                <line x1={x} y1={AXIS_Y - 6} x2={x} y2={AXIS_Y + 6} stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
                <text x={x} y={AXIS_Y + 20} fontSize={9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
                  {tick}
                </text>
              </g>
            );
          })}
          <circle cx={markerX} cy={AXIS_Y} r={6} fill="currentColor" className="text-blue-600 dark:text-blue-400" stroke="white" strokeWidth={1.5} />
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
