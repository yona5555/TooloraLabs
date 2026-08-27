type MotionDiagramProps = {
  v0: number;
  v: number;
  startLabel: string;
  endLabel: string;
  caption: string;
};

const WIDTH = 300;
const HEIGHT = 90;
const TRACK_Y = 60;
const START_X = 40;
const END_X = 260;
const MAX_ARROW = 55;

/**
 * A real motion diagram — the velocity arrows at the start and end points
 * are scaled to the actual computed v0 and v magnitudes, and flip direction
 * for negative values — not a decorative illustration.
 */
export default function MotionDiagram({ v0, v, startLabel, endLabel, caption }: MotionDiagramProps) {
  const maxMagnitude = Math.max(Math.abs(v0), Math.abs(v), 1);
  const startArrowLength = (Math.abs(v0) / maxMagnitude) * MAX_ARROW;
  const endArrowLength = (Math.abs(v) / maxMagnitude) * MAX_ARROW;
  const startDirection = v0 < 0 ? -1 : 1;
  const endDirection = v < 0 ? -1 : 1;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <defs>
            <marker id="motion-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" className="fill-blue-600 dark:fill-blue-400" />
            </marker>
          </defs>

          <line x1={START_X} y1={TRACK_Y} x2={END_X} y2={TRACK_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.3} />
          <circle cx={START_X} cy={TRACK_Y} r={4} className="fill-zinc-500 dark:fill-zinc-400" />
          <circle cx={END_X} cy={TRACK_Y} r={4} className="fill-zinc-500 dark:fill-zinc-400" />

          <line
            x1={START_X}
            y1={TRACK_Y - 15}
            x2={START_X + startDirection * startArrowLength}
            y2={TRACK_Y - 15}
            stroke="currentColor"
            strokeWidth={2}
            className="text-blue-600 dark:text-blue-400"
            markerEnd="url(#motion-arrow)"
          />
          <line
            x1={END_X}
            y1={TRACK_Y - 15}
            x2={END_X + endDirection * endArrowLength}
            y2={TRACK_Y - 15}
            stroke="currentColor"
            strokeWidth={2}
            className="text-blue-600 dark:text-blue-400"
            markerEnd="url(#motion-arrow)"
          />

          <text x={START_X} y={TRACK_Y + 18} fontSize={9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
            {startLabel}
          </text>
          <text x={END_X} y={TRACK_Y + 18} fontSize={9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
            {endLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
