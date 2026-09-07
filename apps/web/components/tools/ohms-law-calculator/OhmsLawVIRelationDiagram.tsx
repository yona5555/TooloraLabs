type OhmsLawVIRelationDiagramProps = {
  xLabel: string;
  yLabel: string;
  slopeLabel: string;
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 160;
const PAD = 28;

/**
 * Voltage plotted against current at a fixed resistance is a straight line
 * through the origin — the visual definition of "Ohm's Law is linear,"
 * whose slope is the resistance. Illustrative geometry, not tied to any one
 * result's numbers.
 */
export default function OhmsLawVIRelationDiagram({ xLabel, yLabel, slopeLabel, caption }: OhmsLawVIRelationDiagramProps) {
  const plotH = HEIGHT - PAD * 2;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + plotH} stroke="currentColor" strokeWidth={1} opacity={0.35} />
          <line x1={PAD} y1={PAD + plotH} x2={WIDTH - PAD} y2={PAD + plotH} stroke="currentColor" strokeWidth={1} opacity={0.35} />

          <line x1={PAD} y1={PAD + plotH} x2={WIDTH - PAD} y2={PAD} stroke="currentColor" strokeWidth={2} className="text-blue-600 dark:text-blue-400" />

          <text x={WIDTH - PAD} y={PAD + plotH + 16} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {xLabel}
          </text>
          <text x={PAD - 6} y={PAD + 4} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {yLabel}
          </text>
          <text x={(PAD + WIDTH - PAD) / 2 + 10} y={(PAD + PAD + plotH) / 2 - 8} fontSize={10} fontWeight={600} className="fill-blue-700 dark:fill-blue-300">
            {slopeLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
