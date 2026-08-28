type GravitationDiagramProps = {
  mass1: number;
  mass2: number;
  label1: string;
  label2: string;
  caption: string;
};

const WIDTH = 280;
const HEIGHT = 90;
const CENTER_Y = 45;
const MIN_RADIUS = 10;
const MAX_RADIUS = 30;
const LEFT_X = 70;
const RIGHT_X = 210;

function radiusFor(mass: number, maxMass: number): number {
  if (maxMass <= 0) return MIN_RADIUS;
  const ratio = Math.max(0, Math.min(1, mass / maxMass));
  return MIN_RADIUS + ratio * (MAX_RADIUS - MIN_RADIUS);
}

/**
 * Two bodies whose circle sizes reflect the real computed masses (relative
 * to each other), with attraction arrows pointing toward one another — not
 * a decorative illustration.
 */
export default function GravitationDiagram({ mass1, mass2, label1, label2, caption }: GravitationDiagramProps) {
  const maxMass = Math.max(mass1, mass2, 1);
  const r1 = radiusFor(mass1, maxMass);
  const r2 = radiusFor(mass2, maxMass);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <defs>
            <marker id="grav-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" className="fill-blue-600 dark:fill-blue-400" />
            </marker>
          </defs>

          <line x1={LEFT_X + r1 + 8} y1={CENTER_Y} x2={RIGHT_X - r2 - 14} y2={CENTER_Y} stroke="currentColor" strokeWidth={2} className="text-blue-600 dark:text-blue-400" markerEnd="url(#grav-arrow)" />
          <line x1={RIGHT_X - r2 - 8} y1={CENTER_Y - 12} x2={LEFT_X + r1 + 14} y2={CENTER_Y - 12} stroke="currentColor" strokeWidth={2} className="text-blue-600 dark:text-blue-400" markerEnd="url(#grav-arrow)" />

          <circle cx={LEFT_X} cy={CENTER_Y} r={r1} className="fill-zinc-400 dark:fill-zinc-500" opacity={0.7} />
          <circle cx={RIGHT_X} cy={CENTER_Y} r={r2} className="fill-zinc-400 dark:fill-zinc-500" opacity={0.7} />

          <text x={LEFT_X} y={CENTER_Y + r1 + 16} fontSize={9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
            {label1}
          </text>
          <text x={RIGHT_X} y={CENTER_Y + r2 + 16} fontSize={9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
            {label2}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
