type KinematicsVelocityTimeDiagramProps = {
  v0: number;
  v: number;
  caption: string;
  xLabel: string;
  yLabel: string;
  areaLabel: string;
};

const WIDTH = 280;
const HEIGHT = 140;
const PAD_L = 34;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 24;

/**
 * A live velocity-vs-time graph: a straight line from v0 to v (constant
 * acceleration is a straight line on this plot), with the area between the
 * line and the time axis shaded — that shaded area is exactly the
 * displacement, dx, which is why the shading is labeled rather than
 * decorative.
 */
export default function KinematicsVelocityTimeDiagram({ v0, v, caption, xLabel, yLabel, areaLabel }: KinematicsVelocityTimeDiagramProps) {
  const plotH = HEIGHT - PAD_T - PAD_B;
  const maxAbs = Math.max(Math.abs(v0), Math.abs(v), 1);

  const yFor = (value: number) => PAD_T + plotH / 2 - (value / maxAbs) * (plotH / 2 - 6);
  const zeroY = yFor(0);
  const y0 = yFor(v0);
  const y1 = yFor(v);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + plotH} stroke="currentColor" strokeWidth={1} opacity={0.35} />
          <line x1={PAD_L} y1={zeroY} x2={WIDTH - PAD_R} y2={zeroY} stroke="currentColor" strokeWidth={1} opacity={0.35} />

          <polygon points={`${PAD_L},${zeroY} ${PAD_L},${y0} ${WIDTH - PAD_R},${y1} ${WIDTH - PAD_R},${zeroY}`} className="fill-blue-500/15" />
          <line x1={PAD_L} y1={y0} x2={WIDTH - PAD_R} y2={y1} stroke="currentColor" strokeWidth={2} className="text-blue-600 dark:text-blue-400" />

          <circle cx={PAD_L} cy={y0} r={3.5} className="fill-blue-600 dark:fill-blue-400" />
          <circle cx={WIDTH - PAD_R} cy={y1} r={3.5} className="fill-blue-600 dark:fill-blue-400" />

          <text x={WIDTH - PAD_R} y={PAD_T + plotH + 16} textAnchor="end" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {xLabel}
          </text>
          <text x={PAD_L - 6} y={PAD_T + 8} textAnchor="end" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {yLabel}
          </text>
          <text x={(PAD_L + WIDTH - PAD_R) / 2} y={(y0 + y1) / 2 + (y0 + y1 > zeroY * 2 ? 14 : -8)} textAnchor="middle" fontSize={9} fontWeight={600} className="fill-blue-700 dark:fill-blue-300">
            {areaLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
