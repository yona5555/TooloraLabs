type UnitCircleDiagramProps = {
  sinLabel: string;
  cosLabel: string;
  angleLabel: string;
  caption: string;
};

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 80;
const ANGLE_DEG = 40;
const ANGLE_RAD = (ANGLE_DEG * Math.PI) / 180;
const ARC_RADIUS = 26;

export default function UnitCircleDiagram({ sinLabel, cosLabel, angleLabel, caption }: UnitCircleDiagramProps) {
  const px = CENTER + RADIUS * Math.cos(ANGLE_RAD);
  const py = CENTER - RADIUS * Math.sin(ANGLE_RAD);
  const arcEndX = CENTER + ARC_RADIUS * Math.cos(ANGLE_RAD);
  const arcEndY = CENTER - ARC_RADIUS * Math.sin(ANGLE_RAD);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={caption} className="h-auto w-56 text-current">
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5} />

          <line x1={CENTER - RADIUS - 14} y1={CENTER} x2={CENTER + RADIUS + 14} y2={CENTER} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <line x1={CENTER} y1={CENTER - RADIUS - 14} x2={CENTER} y2={CENTER + RADIUS + 14} stroke="currentColor" strokeWidth={1} opacity={0.3} />

          <line x1={CENTER} y1={CENTER} x2={px} y2={py} stroke="currentColor" strokeWidth={2} />
          <line x1={CENTER} y1={CENTER} x2={px} y2={CENTER} stroke="currentColor" strokeWidth={2} strokeDasharray="4 3" />
          <line x1={px} y1={CENTER} x2={px} y2={py} stroke="currentColor" strokeWidth={2} strokeDasharray="4 3" />

          <path
            d={`M ${CENTER + ARC_RADIUS} ${CENTER} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 0 ${arcEndX} ${arcEndY}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
          />

          <circle cx={px} cy={py} r={3} fill="currentColor" />

          <text x={CENTER + ARC_RADIUS + 8} y={CENTER - 10} fontSize={11} fill="currentColor">
            {angleLabel}
          </text>
          <text x={(CENTER + px) / 2} y={CENTER + 16} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
            {cosLabel}
          </text>
          <text x={px + 8} y={(CENTER + py) / 2} fontSize={11} fontWeight={700} fill="currentColor">
            {sinLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
