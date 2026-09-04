type Props = {
  ax: number;
  ay: number;
  unitAX: number | null;
  unitAY: number | null;
  labelA: string;
  labelUnit: string;
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 220;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const PADDING = 30;

/**
 * Shows vector A alongside its unit vector Â — same direction, rescaled to
 * length 1. The dashed circle has radius 1 in the same coordinate scale as
 * A's arrow, so Â's tip always lands exactly on the circle, making
 * "normalizing" visually obvious rather than just a formula.
 */
export default function VectorUnitDiagram({ ax, ay, unitAX, unitAY, labelA, labelUnit, caption }: Props) {
  const maxExtent = Math.max(Math.abs(ax), Math.abs(ay), 1.5, 1e-6);
  const scale = (Math.min(CENTER_X, CENTER_Y) - PADDING) / maxExtent;
  const toSvg = (x: number, y: number) => ({ px: CENTER_X + x * scale, py: CENTER_Y - y * scale });

  const origin = toSvg(0, 0);
  const aTip = toSvg(ax, ay);
  const hasUnit = unitAX !== null && unitAY !== null;
  const unitTip = hasUnit ? toSvg(unitAX as number, unitAY as number) : origin;

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
          <circle cx={origin.px} cy={origin.py} r={scale} fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" className="text-teal-400 dark:text-teal-500" opacity={0.6} />

          {arrow(aTip, "text-blue-600 dark:text-blue-400", "a")}
          {hasUnit && arrow(unitTip, "text-teal-500 dark:text-teal-400", "unit")}

          <text x={aTip.px + 4} y={aTip.py - 4} fontSize={10} className="fill-blue-600 dark:fill-blue-400">
            {labelA}
          </text>
          {hasUnit && (
            <text x={unitTip.px + 4} y={unitTip.py + 12} fontSize={10} className="fill-teal-600 dark:fill-teal-400">
              {labelUnit}
            </text>
          )}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
