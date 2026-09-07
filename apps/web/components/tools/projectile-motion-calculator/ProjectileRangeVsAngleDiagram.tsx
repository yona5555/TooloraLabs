type ProjectileRangeVsAngleDiagramProps = {
  xLabel: string;
  yLabel: string;
  peakLabel: string;
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 130;
const PAD = 26;

/**
 * A fixed illustrative range-vs-launch-angle curve for a level launch (no
 * height offset): range is proportional to sin(2*angle), which peaks at
 * 45 degrees — the classic result that motivates that angle for maximum
 * distance. Conceptual geometry, not tied to any one result's numbers.
 */
export default function ProjectileRangeVsAngleDiagram({ xLabel, yLabel, peakLabel, caption }: ProjectileRangeVsAngleDiagramProps) {
  const plotW = WIDTH - PAD * 2;
  const plotH = HEIGHT - PAD * 2;

  const points = Array.from({ length: 46 }, (_, i) => {
    const angleDeg = i * 2;
    const x = PAD + (angleDeg / 90) * plotW;
    const y = PAD + plotH - Math.sin((angleDeg * Math.PI) / 90) * plotH;
    return `${x},${y}`;
  }).join(" ");

  const peakX = PAD + 0.5 * plotW;
  const peakY = PAD;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + plotH} stroke="currentColor" strokeWidth={1} opacity={0.35} />
          <line x1={PAD} y1={PAD + plotH} x2={WIDTH - PAD} y2={PAD + plotH} stroke="currentColor" strokeWidth={1} opacity={0.35} />

          <polyline points={points} fill="none" stroke="currentColor" strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
          <circle cx={peakX} cy={peakY} r={3.5} className="fill-blue-600 dark:fill-blue-400" />
          <text x={peakX} y={peakY - 8} textAnchor="middle" fontSize={9} fontWeight={600} className="fill-blue-700 dark:fill-blue-300">
            {peakLabel}
          </text>

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
