type KinematicsReferenceAccelerationsDiagramProps = {
  caption: string;
  labels: string[];
};

const REFERENCE_POINTS = [1, 3, 8, 9.8, 30];
const MIN_VALUE = 0;
const MAX_VALUE = 35;
const WIDTH = 320;
const MARGIN = 18;
const AXIS_WIDTH = WIDTH - MARGIN * 2;
const HEIGHT = 60;
const AXIS_Y = 24;

function xForValue(value: number): number {
  const clamped = Math.min(MAX_VALUE, Math.max(MIN_VALUE, value));
  return MARGIN + ((clamped - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * AXIS_WIDTH;
}

/**
 * A fixed illustrative scale comparing everyday acceleration magnitudes —
 * a gentle car stop, hard braking, a roller coaster drop, free-fall gravity
 * (marked), and a rocket launch — giving concrete real-world context for
 * what an acceleration value in m/s^2 actually feels like.
 */
export default function KinematicsReferenceAccelerationsDiagram({ caption, labels }: KinematicsReferenceAccelerationsDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <line x1={MARGIN} y1={AXIS_Y} x2={WIDTH - MARGIN} y2={AXIS_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          {REFERENCE_POINTS.map((value, index) => {
            const x = xForValue(value);
            const staggered = index % 2 === 1;
            const labelY = staggered ? AXIS_Y + 32 : AXIS_Y + 20;
            return (
              <g key={value}>
                <line x1={x} y1={AXIS_Y - 5} x2={x} y2={staggered ? AXIS_Y + 12 : AXIS_Y + 5} stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
                <text x={x} y={labelY} fontSize={9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
                  {labels[index]}
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
