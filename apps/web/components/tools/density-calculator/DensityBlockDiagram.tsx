type DensityBlockDiagramProps = {
  volume: number;
  density: number;
  massLabel: string;
  volumeLabel: string;
  densityLabel: string;
  caption: string;
};

const WIDTH = 280;
const HEIGHT = 140;
const BASE_Y = 118;
const MAX_BLOCK_WIDTH = 190;
const MAX_BLOCK_HEIGHT = 78;
const MIN_BLOCK = 18;

/**
 * A live rectangle model of the current inputs: width scales with volume,
 * height scales with density, so the block's area is a direct visual analog
 * of mass = density x volume. Both dimensions are normalized independently
 * (log-ish clamp) purely for legibility across wildly different magnitudes
 * (a gas's density vs. a metal's), not to preserve a literal area-to-mass
 * ratio in pixels.
 */
export default function DensityBlockDiagram({ volume, density, massLabel, volumeLabel, densityLabel, caption }: DensityBlockDiagramProps) {
  const safeVolume = Number.isFinite(volume) && volume > 0 ? volume : 1;
  const safeDensity = Number.isFinite(density) && density > 0 ? density : 1;

  const scale = (v: number) => {
    const logV = Math.log10(v + 1);
    const t = Math.min(1, logV / 3);
    return t;
  };

  const blockWidth = MIN_BLOCK + scale(safeVolume) * (MAX_BLOCK_WIDTH - MIN_BLOCK);
  const blockHeight = MIN_BLOCK + scale(safeDensity) * (MAX_BLOCK_HEIGHT - MIN_BLOCK);
  const blockX = (WIDTH - blockWidth) / 2;
  const blockY = BASE_Y - blockHeight;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <line x1={16} y1={BASE_Y} x2={WIDTH - 16} y2={BASE_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />

          <rect x={blockX} y={blockY} width={blockWidth} height={blockHeight} rx={4} className="fill-blue-500/25 stroke-blue-600 dark:fill-blue-400/20 dark:stroke-blue-400" strokeWidth={1.5} />
          <text x={WIDTH / 2} y={blockY + blockHeight / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {massLabel}
          </text>

          <line x1={blockX} y1={BASE_Y + 10} x2={blockX + blockWidth} y2={BASE_Y + 10} stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <text x={blockX + blockWidth / 2} y={BASE_Y + 24} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {volumeLabel}
          </text>

          <line x1={blockX - 10} y1={blockY} x2={blockX - 10} y2={BASE_Y} stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <text x={blockX - 16} y={(blockY + BASE_Y) / 2} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {densityLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
