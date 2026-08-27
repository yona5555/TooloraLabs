type WorkVectorDiagramProps = {
  angleDegrees: number;
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 110;
const ORIGIN_X = 30;
const ORIGIN_Y = 85;
const DISPLACEMENT_LENGTH = 200;
const FORCE_LENGTH = 90;

/**
 * A real force vector drawn at the actual entered angle relative to the
 * displacement direction — not a decorative illustration. The angle the
 * arrow makes with the horizontal changes exactly as the input changes.
 */
export default function WorkVectorDiagram({ angleDegrees, caption }: WorkVectorDiagramProps) {
  const clampedAngle = Math.max(-90, Math.min(90, angleDegrees));
  const radians = (clampedAngle * Math.PI) / 180;
  const forceEndX = ORIGIN_X + FORCE_LENGTH * Math.cos(radians);
  const forceEndY = ORIGIN_Y - FORCE_LENGTH * Math.sin(radians);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <defs>
            <marker id="work-arrow-d" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-zinc-400 dark:fill-zinc-500" />
            </marker>
            <marker id="work-arrow-f" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-blue-600 dark:fill-blue-400" />
            </marker>
          </defs>

          <line
            x1={ORIGIN_X}
            y1={ORIGIN_Y}
            x2={ORIGIN_X + DISPLACEMENT_LENGTH}
            y2={ORIGIN_Y}
            stroke="currentColor"
            strokeWidth={2}
            className="text-zinc-400 dark:text-zinc-500"
            markerEnd="url(#work-arrow-d)"
          />
          <line
            x1={ORIGIN_X}
            y1={ORIGIN_Y}
            x2={forceEndX}
            y2={forceEndY}
            stroke="currentColor"
            strokeWidth={2.5}
            className="text-blue-600 dark:text-blue-400"
            markerEnd="url(#work-arrow-f)"
          />
          <text x={ORIGIN_X + DISPLACEMENT_LENGTH / 2} y={ORIGIN_Y + 18} fontSize={10} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
            d
          </text>
          <text x={forceEndX + 6} y={forceEndY - 2} fontSize={10} textAnchor="start" className="fill-blue-600 dark:fill-blue-400">
            F
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
