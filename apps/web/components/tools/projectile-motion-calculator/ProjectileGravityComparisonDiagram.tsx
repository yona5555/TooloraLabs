type ProjectileGravityComparisonDiagramProps = {
  labels: string[];
  caption: string;
};

const RELATIVE_RANGES = [1, 6, 2.6];
const MAX_BAR_HEIGHT = 80;
const BAR_WIDTH = 44;
const GAP = 30;

/**
 * A fixed illustrative bar comparison of the same launch (same speed and
 * angle) on Earth, the Moon, and Mars — since range scales inversely with
 * gravity, the identical shot travels roughly six times farther on the
 * Moon and over twice as far on Mars.
 */
export default function ProjectileGravityComparisonDiagram({ labels, caption }: ProjectileGravityComparisonDiagramProps) {
  const maxValue = Math.max(...RELATIVE_RANGES);
  const width = RELATIVE_RANGES.length * (BAR_WIDTH + GAP) + GAP;
  const height = MAX_BAR_HEIGHT + 50;
  const baseY = MAX_BAR_HEIGHT + 20;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <line x1={10} y1={baseY} x2={width - 10} y2={baseY} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          {RELATIVE_RANGES.map((value, i) => {
            const barHeight = (value / maxValue) * MAX_BAR_HEIGHT;
            const x = GAP + i * (BAR_WIDTH + GAP);
            const y = baseY - barHeight;
            return (
              <g key={i} className="transition-opacity duration-200 hover:opacity-80">
                <rect x={x} y={y} width={BAR_WIDTH} height={barHeight} rx={4} className="fill-blue-500/70 stroke-blue-600 dark:fill-blue-400/60 dark:stroke-blue-400" strokeWidth={1.2} />
                <text x={x + BAR_WIDTH / 2} y={y - 6} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
                  ×{value}
                </text>
                <text x={x + BAR_WIDTH / 2} y={baseY + 16} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
                  {labels[i]}
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
