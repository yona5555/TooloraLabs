type ProjectileImpactVelocityDiagramProps = {
  impactAngleDegrees: number;
  speedLabel: string;
  angleLabel: string;
  caption: string;
};

const ORIGIN_X = 20;
const ORIGIN_Y = 20;
const LENGTH = 90;

/**
 * A live vector showing the impact velocity's direction (below horizontal,
 * since the projectile is descending) at the actual computed impact angle.
 */
export default function ProjectileImpactVelocityDiagram({ impactAngleDegrees, speedLabel, angleLabel, caption }: ProjectileImpactVelocityDiagramProps) {
  const clampedAngle = Math.max(0, Math.min(90, impactAngleDegrees));
  const radians = (clampedAngle * Math.PI) / 180;
  const endX = ORIGIN_X + LENGTH * Math.cos(radians);
  const endY = ORIGIN_Y + LENGTH * Math.sin(radians);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 220 110" role="img" aria-label={caption} className="h-auto w-full max-w-[240px] text-current">
          <defs>
            <marker id="piv-arrow" markerWidth={8} markerHeight={8} refX={6} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-blue-600 dark:fill-blue-400" />
            </marker>
          </defs>

          <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={ORIGIN_X + LENGTH} y2={ORIGIN_Y} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.35} />
          <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={endX} y2={endY} stroke="currentColor" strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" markerEnd="url(#piv-arrow)" />

          <text x={endX + 6} y={endY} textAnchor="start" fontSize={9} fontWeight={600} className="fill-blue-700 dark:fill-blue-300">
            {speedLabel}
          </text>
          <text x={ORIGIN_X + 40} y={ORIGIN_Y + 16} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {angleLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
