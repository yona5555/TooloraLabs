type DensityMaterialScaleDiagramProps = {
  densityGPerCm3: number;
  caption: string;
  materials: { label: string; value: number }[];
};

const MIN_LOG = -3;
const MAX_LOG = 1.5;
const WIDTH = 340;
const MARGIN = 18;
const AXIS_WIDTH = WIDTH - MARGIN * 2;
const HEIGHT = 88;
const AXIS_Y = 24;

function xForDensity(value: number): number {
  const safe = value > 0 ? value : 10 ** MIN_LOG;
  const log = Math.log10(safe);
  const clamped = Math.min(MAX_LOG, Math.max(MIN_LOG, log));
  return MARGIN + ((clamped - MIN_LOG) / (MAX_LOG - MIN_LOG)) * AXIS_WIDTH;
}

/**
 * A real, mathematically precise position on a logarithmic density scale —
 * the marker's x-coordinate is computed directly from log10(density), not a
 * decorative illustration, so it moves to the exact spot for every result.
 */
export default function DensityMaterialScaleDiagram({ densityGPerCm3, caption, materials }: DensityMaterialScaleDiagramProps) {
  const markerX = xForDensity(densityGPerCm3);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <line x1={MARGIN} y1={AXIS_Y} x2={WIDTH - MARGIN} y2={AXIS_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          {materials.map((material, index) => {
            const x = xForDensity(material.value);
            const staggered = index % 2 === 1;
            const labelY = staggered ? AXIS_Y + 32 : AXIS_Y + 20;
            return (
              <g key={material.label}>
                <line
                  x1={x}
                  y1={AXIS_Y - 5}
                  x2={x}
                  y2={staggered ? AXIS_Y + 12 : AXIS_Y + 5}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  opacity={0.5}
                />
                <text x={x} y={labelY} fontSize={9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
                  {material.label}
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
