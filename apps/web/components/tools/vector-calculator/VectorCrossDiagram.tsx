type Props = {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  crossX: number;
  crossY: number;
  crossZ: number;
  labelA: string;
  labelB: string;
  labelCross: string;
  caption: string;
};

const WIDTH = 280;
const HEIGHT = 240;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2 + 20;
const PADDING = 34;

/** Standard isometric projection: x and z share the horizontal spread, y points up the screen. */
function isometric(x: number, y: number, z: number) {
  return { ix: (x - z) * Math.cos(Math.PI / 6), iy: (x + z) * Math.sin(Math.PI / 6) - y };
}

/**
 * A true 3D diagram (isometric projection) of A, B, and their cross product
 * A × B — the one relationship a flat 2D diagram can't show honestly, since
 * the cross product is always perpendicular to the plane containing A and
 * B. Rendered live from the actual component values, not a fixed
 * illustration.
 */
export default function VectorCrossDiagram({ ax, ay, az, bx, by, bz, crossX, crossY, crossZ, labelA, labelB, labelCross, caption }: Props) {
  const points = [isometric(ax, ay, az), isometric(bx, by, bz), isometric(crossX, crossY, crossZ)];
  const maxExtent = Math.max(...points.map((p) => Math.max(Math.abs(p.ix), Math.abs(p.iy))), 1e-6);
  const scale = (Math.min(WIDTH, HEIGHT) / 2 - PADDING) / maxExtent;

  const toSvg = (x: number, y: number, z: number) => {
    const { ix, iy } = isometric(x, y, z);
    return { px: CENTER_X + ix * scale, py: CENTER_Y - iy * scale };
  };

  const origin = toSvg(0, 0, 0);
  const aTip = toSvg(ax, ay, az);
  const bTip = toSvg(bx, by, bz);
  const crossTip = toSvg(crossX, crossY, crossZ);
  const hasCross = Math.abs(crossX) > 1e-9 || Math.abs(crossY) > 1e-9 || Math.abs(crossZ) > 1e-9;

  const axisLength = maxExtent * 0.9;
  const axisX = toSvg(axisLength, 0, 0);
  const axisY = toSvg(0, axisLength, 0);
  const axisZ = toSvg(0, 0, axisLength);

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

  // The parallelogram spanned by A and B, shaded faintly to make "the plane containing both" visible —
  // the cross product's defining property is that it's perpendicular to this exact surface.
  const parallelogramTip = toSvg(ax + bx, ay + by, az + bz);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs">
          <line x1={origin.px} y1={origin.py} x2={axisX.px} y2={axisX.py} stroke="currentColor" strokeWidth={1} opacity={0.15} />
          <line x1={origin.px} y1={origin.py} x2={axisY.px} y2={axisY.py} stroke="currentColor" strokeWidth={1} opacity={0.15} />
          <line x1={origin.px} y1={origin.py} x2={axisZ.px} y2={axisZ.py} stroke="currentColor" strokeWidth={1} opacity={0.15} />

          <polygon
            points={`${origin.px},${origin.py} ${aTip.px},${aTip.py} ${parallelogramTip.px},${parallelogramTip.py} ${bTip.px},${bTip.py}`}
            className="fill-blue-500/10 dark:fill-blue-400/10"
          />

          {arrow(aTip, "text-blue-600 dark:text-blue-400", "a")}
          {arrow(bTip, "text-orange-500 dark:text-orange-400", "b")}
          {hasCross && arrow(crossTip, "text-purple-500 dark:text-purple-400", "cross")}

          <text x={aTip.px + 4} y={aTip.py - 4} fontSize={10} className="fill-blue-600 dark:fill-blue-400">
            {labelA}
          </text>
          <text x={bTip.px + 4} y={bTip.py - 4} fontSize={10} className="fill-orange-500 dark:fill-orange-400">
            {labelB}
          </text>
          {hasCross && (
            <text x={crossTip.px + 4} y={crossTip.py - 4} fontSize={10} className="fill-purple-600 dark:fill-purple-400">
              {labelCross}
            </text>
          )}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
