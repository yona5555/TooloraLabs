type ForceBlockDiagramProps = {
  force: number;
  acceleration: number;
  forceLabel: string;
  accelerationLabel: string;
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 100;
const BLOCK_X = 70;
const BLOCK_Y = 40;
const BLOCK_SIZE = 44;
const MAX_ARROW = 90;

/**
 * A real block-and-arrow diagram — the force and acceleration arrow
 * lengths are scaled to the actual computed magnitudes (relative to each
 * other), not a decorative illustration.
 */
export default function ForceBlockDiagram({ force, acceleration, forceLabel, accelerationLabel, caption }: ForceBlockDiagramProps) {
  const maxMagnitude = Math.max(Math.abs(force), Math.abs(acceleration), 1);
  const forceLength = (Math.abs(force) / maxMagnitude) * MAX_ARROW;
  const accelLength = (Math.abs(acceleration) / maxMagnitude) * MAX_ARROW * 0.6;
  const forceDir = force < 0 ? -1 : 1;
  const accelDir = acceleration < 0 ? -1 : 1;
  const blockRight = BLOCK_X + BLOCK_SIZE;
  const blockCenterY = BLOCK_Y + BLOCK_SIZE / 2;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <defs>
            <marker id="force-arrow-f" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-blue-600 dark:fill-blue-400" />
            </marker>
            <marker id="force-arrow-a" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-orange-500 dark:fill-orange-400" />
            </marker>
          </defs>

          <rect x={BLOCK_X} y={BLOCK_Y} width={BLOCK_SIZE} height={BLOCK_SIZE} rx={4} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5} />

          <line
            x1={forceDir > 0 ? blockRight : BLOCK_X}
            y1={blockCenterY - 10}
            x2={(forceDir > 0 ? blockRight : BLOCK_X) + forceDir * forceLength}
            y2={blockCenterY - 10}
            stroke="currentColor"
            strokeWidth={2.5}
            className="text-blue-600 dark:text-blue-400"
            markerEnd="url(#force-arrow-f)"
          />
          <text x={(forceDir > 0 ? blockRight : BLOCK_X) + forceDir * (forceLength + 12)} y={blockCenterY - 6} fontSize={10} textAnchor="middle" className="fill-blue-600 dark:fill-blue-400">
            {forceLabel}
          </text>

          <line
            x1={forceDir > 0 ? blockRight : BLOCK_X}
            y1={blockCenterY + 15}
            x2={(forceDir > 0 ? blockRight : BLOCK_X) + accelDir * accelLength}
            y2={blockCenterY + 15}
            stroke="currentColor"
            strokeWidth={2}
            className="text-orange-500 dark:text-orange-400"
            markerEnd="url(#force-arrow-a)"
          />
          <text x={(forceDir > 0 ? blockRight : BLOCK_X) + accelDir * (accelLength + 14)} y={blockCenterY + 19} fontSize={10} textAnchor="middle" className="fill-orange-500 dark:fill-orange-400">
            {accelerationLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
