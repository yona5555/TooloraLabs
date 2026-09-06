type ProjectileVelocityComponentsDiagramProps = {
  angleDegrees: number;
  vxLabel: string;
  vyLabel: string;
  vLabel: string;
  caption: string;
};

const ORIGIN_X = 20;
const ORIGIN_Y = 90;
const LENGTH = 90;

/**
 * A live vector-decomposition diagram: the launch velocity arrow is drawn
 * at the actual entered angle, with dashed horizontal/vertical projections
 * showing vx = v*cos(angle) and vy = v*sin(angle) — the two components the
 * rest of the calculation is built from.
 */
export default function ProjectileVelocityComponentsDiagram({ angleDegrees, vxLabel, vyLabel, vLabel, caption }: ProjectileVelocityComponentsDiagramProps) {
  const clampedAngle = Math.max(0, Math.min(90, angleDegrees));
  const radians = (clampedAngle * Math.PI) / 180;
  const endX = ORIGIN_X + LENGTH * Math.cos(radians);
  const endY = ORIGIN_Y - LENGTH * Math.sin(radians);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 220 110" role="img" aria-label={caption} className="h-auto w-full max-w-[240px] text-current">
          <defs>
            <marker id="pvc-arrow" markerWidth={8} markerHeight={8} refX={6} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-blue-600 dark:fill-blue-400" />
            </marker>
          </defs>

          <line x1={ORIGIN_X} y1={endY} x2={endX} y2={endY} stroke="currentColor" strokeWidth={1.2} strokeDasharray="3 3" opacity={0.4} />
          <line x1={endX} y1={ORIGIN_Y} x2={endX} y2={endY} stroke="currentColor" strokeWidth={1.2} strokeDasharray="3 3" opacity={0.4} />

          <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={endX} y2={ORIGIN_Y} stroke="currentColor" strokeWidth={2} className="text-zinc-500 dark:text-zinc-400" markerEnd="url(#pvc-arrow)" />
          <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={ORIGIN_X} y2={endY} stroke="currentColor" strokeWidth={2} className="text-zinc-500 dark:text-zinc-400" markerEnd="url(#pvc-arrow)" />
          <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={endX} y2={endY} stroke="currentColor" strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" markerEnd="url(#pvc-arrow)" />

          <text x={(ORIGIN_X + endX) / 2} y={ORIGIN_Y + 14} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {vxLabel}
          </text>
          <text x={ORIGIN_X - 6} y={(ORIGIN_Y + endY) / 2} textAnchor="end" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {vyLabel}
          </text>
          <text x={endX + 6} y={endY - 4} textAnchor="start" fontSize={9} fontWeight={600} className="fill-blue-700 dark:fill-blue-300">
            {vLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
