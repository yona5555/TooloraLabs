type GpaScaleDiagramProps = {
  gpa: number;
  caption: string;
};

const MIN = 0;
const MAX = 4.0;
const WIDTH = 320;
const MARGIN = 16;
const AXIS_WIDTH = WIDTH - MARGIN * 2;
const HEIGHT = 56;
const AXIS_Y = 20;
const TICKS = [0, 1.0, 2.0, 3.0, 4.0];

function xForGpa(value: number): number {
  const clamped = Math.min(MAX, Math.max(MIN, value));
  return MARGIN + ((clamped - MIN) / (MAX - MIN)) * AXIS_WIDTH;
}

/**
 * A real, precisely computed marker position on the 0-4.0 GPA scale — driven
 * directly by the actual calculated GPA, not a decorative illustration.
 */
export default function GpaScaleDiagram({ gpa, caption }: GpaScaleDiagramProps) {
  const markerX = xForGpa(gpa);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <line x1={MARGIN} y1={AXIS_Y} x2={WIDTH - MARGIN} y2={AXIS_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          {TICKS.map((tick) => {
            const x = xForGpa(tick);
            return (
              <g key={tick}>
                <line x1={x} y1={AXIS_Y - 5} x2={x} y2={AXIS_Y + 5} stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
                <text x={x} y={AXIS_Y + 20} fontSize={10} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
                  {tick.toFixed(1)}
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
