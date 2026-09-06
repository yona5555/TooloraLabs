type KinematicsPositionTimeDiagramProps = {
  caption: string;
  xLabel: string;
  yLabel: string;
};

const WIDTH = 260;
const HEIGHT = 130;
const PAD = 26;

/**
 * A fixed illustrative position-vs-time curve for constant acceleration —
 * a parabola, not a straight line, because position is the integral of a
 * linear velocity function. Purely conceptual geometry, not tied to any
 * one result's numbers.
 */
export default function KinematicsPositionTimeDiagram({ caption, xLabel, yLabel }: KinematicsPositionTimeDiagramProps) {
  const plotW = WIDTH - PAD * 2;
  const plotH = HEIGHT - PAD * 2;

  const points = Array.from({ length: 21 }, (_, i) => {
    const t = i / 20;
    const x = PAD + t * plotW;
    const y = PAD + plotH - (t * t) * plotH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + plotH} stroke="currentColor" strokeWidth={1} opacity={0.35} />
          <line x1={PAD} y1={PAD + plotH} x2={WIDTH - PAD} y2={PAD + plotH} stroke="currentColor" strokeWidth={1} opacity={0.35} />

          <polyline points={points} fill="none" stroke="currentColor" strokeWidth={2} className="text-blue-600 dark:text-blue-400" />

          <text x={WIDTH - PAD} y={PAD + plotH + 16} textAnchor="end" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {xLabel}
          </text>
          <text x={PAD - 6} y={PAD + 8} textAnchor="end" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {yLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
