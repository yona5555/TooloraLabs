type Props = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  projectionX: number | null;
  projectionY: number | null;
  labelA: string;
  labelB: string;
  labelProjection: string;
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 220;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const PADDING = 30;

/**
 * Shows A's "shadow" cast straight down onto B's line — the vector
 * projection of A onto B. A dashed perpendicular segment connects A's tip
 * to the projection point, making the geometric meaning (how far along B's
 * direction A actually reaches) visible rather than just the formula.
 */
export default function VectorProjectionDiagram({ ax, ay, bx, by, projectionX, projectionY, labelA, labelB, labelProjection, caption }: Props) {
  const maxExtent = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), 1e-6);
  const scale = (Math.min(CENTER_X, CENTER_Y) - PADDING) / maxExtent;
  const toSvg = (x: number, y: number) => ({ px: CENTER_X + x * scale, py: CENTER_Y - y * scale });

  const origin = toSvg(0, 0);
  const aTip = toSvg(ax, ay);
  const bTip = toSvg(bx, by);
  const hasProjection = projectionX !== null && projectionY !== null;
  const projTip = hasProjection ? toSvg(projectionX as number, projectionY as number) : origin;

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

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs">
          <line x1={0} y1={CENTER_Y} x2={WIDTH} y2={CENTER_Y} stroke="currentColor" strokeWidth={1} opacity={0.2} />
          <line x1={CENTER_X} y1={0} x2={CENTER_X} y2={HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.2} />

          {/* B's full line, extended both directions, as a faint guide */}
          <line
            x1={CENTER_X - (bTip.px - CENTER_X) * 2}
            y1={CENTER_Y - (bTip.py - CENTER_Y) * 2}
            x2={CENTER_X + (bTip.px - CENTER_X) * 2}
            y2={CENTER_Y + (bTip.py - CENTER_Y) * 2}
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="2 3"
            className="text-orange-300 dark:text-orange-500/50"
          />

          {hasProjection && (
            <line x1={aTip.px} y1={aTip.py} x2={projTip.px} y2={projTip.py} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" className="text-zinc-400 dark:text-zinc-500" />
          )}

          {arrow(aTip, "text-blue-600 dark:text-blue-400", "a")}
          {arrow(bTip, "text-orange-500 dark:text-orange-400", "b")}
          {hasProjection && arrow(projTip, "text-rose-500 dark:text-rose-400", "proj")}

          <text x={aTip.px + 4} y={aTip.py - 4} fontSize={10} className="fill-blue-600 dark:fill-blue-400">
            {labelA}
          </text>
          <text x={bTip.px + 4} y={bTip.py - 4} fontSize={10} className="fill-orange-500 dark:fill-orange-400">
            {labelB}
          </text>
          {hasProjection && (
            <text x={projTip.px - 4} y={projTip.py + 14} fontSize={10} textAnchor="end" className="fill-rose-600 dark:fill-rose-400">
              {labelProjection}
            </text>
          )}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
