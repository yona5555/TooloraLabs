type Props = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  angleDegrees: number | null;
  labelA: string;
  labelB: string;
  angleLabel: string;
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 220;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const PADDING = 30;
const ARC_RADIUS = 28;

/**
 * A 2D projection showing vectors A and B from the origin with the angle
 * between them traced as an arc — the same angle the dot-product formula
 * (cos θ = A·B / (|A||B|)) solves for. The arc's sweep direction always
 * follows the shorter path between A and B, matching the 0°–180° range
 * the calculator itself reports.
 */
export default function VectorAngleDiagram({ ax, ay, bx, by, angleDegrees, labelA, labelB, angleLabel, caption }: Props) {
  const maxExtent = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), 1e-6);
  const scale = (Math.min(CENTER_X, CENTER_Y) - PADDING) / maxExtent;
  const toSvg = (x: number, y: number) => ({ px: CENTER_X + x * scale, py: CENTER_Y - y * scale });

  const origin = toSvg(0, 0);
  const aTip = toSvg(ax, ay);
  const bTip = toSvg(bx, by);

  const arrow = (to: { px: number; py: number }, className: string, key: string) => {
    const angle = Math.atan2(origin.py - to.py, to.px - origin.px);
    const headLength = 8;
    const leftX = to.px - headLength * Math.cos(angle - Math.PI / 6);
    const leftY = to.py + headLength * Math.sin(angle - Math.PI / 6);
    const rightX = to.px - headLength * Math.cos(angle + Math.PI / 6);
    const rightY = to.py + headLength * Math.sin(angle + Math.PI / 6);
    return (
      <g key={key} className={className}>
        <line x1={origin.px} y1={origin.py} x2={to.px} y2={to.py} stroke="currentColor" strokeWidth={2} />
        <polygon points={`${to.px},${to.py} ${leftX},${leftY} ${rightX},${rightY}`} fill="currentColor" />
      </g>
    );
  };

  const hasDirection = (Math.abs(ax) > 1e-9 || Math.abs(ay) > 1e-9) && (Math.abs(bx) > 1e-9 || Math.abs(by) > 1e-9);

  let arcPoints = "";
  let midPoint = { px: origin.px, py: origin.py };
  if (hasDirection) {
    const thetaA = Math.atan2(ay, ax);
    let thetaB = Math.atan2(by, bx);
    let delta = thetaB - thetaA;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    thetaB = thetaA + delta;

    const steps = 24;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = thetaA + (delta * i) / steps;
      const p = toSvg((ARC_RADIUS / scale) * Math.cos(t), (ARC_RADIUS / scale) * Math.sin(t));
      pts.push(`${p.px.toFixed(2)},${p.py.toFixed(2)}`);
    }
    arcPoints = pts.join(" ");
    const mid = thetaA + delta / 2;
    midPoint = toSvg(((ARC_RADIUS + 16) / scale) * Math.cos(mid), ((ARC_RADIUS + 16) / scale) * Math.sin(mid));
  }

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs">
          <line x1={0} y1={CENTER_Y} x2={WIDTH} y2={CENTER_Y} stroke="currentColor" strokeWidth={1} opacity={0.2} />
          <line x1={CENTER_X} y1={0} x2={CENTER_X} y2={HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.2} />

          {hasDirection && (
            <polyline points={arcPoints} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-purple-500 dark:text-purple-400" />
          )}
          {arrow(aTip, "text-blue-600 dark:text-blue-400", "a")}
          {arrow(bTip, "text-orange-500 dark:text-orange-400", "b")}

          <text x={aTip.px + 4} y={aTip.py - 4} fontSize={10} className="fill-blue-600 dark:fill-blue-400">
            {labelA}
          </text>
          <text x={bTip.px + 4} y={bTip.py - 4} fontSize={10} className="fill-orange-500 dark:fill-orange-400">
            {labelB}
          </text>
          {hasDirection && angleDegrees !== null && (
            <text x={midPoint.px} y={midPoint.py} fontSize={10} textAnchor="middle" className="fill-purple-600 dark:fill-purple-400">
              {angleLabel}
            </text>
          )}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
