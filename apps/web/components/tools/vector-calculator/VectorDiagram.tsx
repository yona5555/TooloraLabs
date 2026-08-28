type VectorDiagramProps = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  sumX: number;
  sumY: number;
  labelA: string;
  labelB: string;
  labelSum: string;
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 220;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const PADDING = 30;

/**
 * A 2D projection (x, y only — the z component isn't shown) of vectors A, B,
 * and their sum, drawn as arrows from the origin at the center of the plot,
 * scaled from their actual component values so the picture always matches
 * the numbers, not a fixed illustration.
 */
export default function VectorDiagram({ ax, ay, bx, by, sumX, sumY, labelA, labelB, labelSum, caption }: VectorDiagramProps) {
  const maxExtent = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), Math.abs(sumX), Math.abs(sumY), 1e-6);
  const scale = (Math.min(CENTER_X, CENTER_Y) - PADDING) / maxExtent;

  const toSvg = (x: number, y: number) => ({ px: CENTER_X + x * scale, py: CENTER_Y - y * scale });

  const origin = toSvg(0, 0);
  const aTip = toSvg(ax, ay);
  const bTip = toSvg(bx, by);
  const sumTip = toSvg(sumX, sumY);

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

          {arrow(sumTip, "text-emerald-500 dark:text-emerald-400", "sum")}
          {arrow(aTip, "text-blue-600 dark:text-blue-400", "a")}
          {arrow(bTip, "text-orange-500 dark:text-orange-400", "b")}

          <text x={aTip.px + 4} y={aTip.py - 4} fontSize={10} className="fill-blue-600 dark:fill-blue-400">
            {labelA}
          </text>
          <text x={bTip.px + 4} y={bTip.py - 4} fontSize={10} className="fill-orange-500 dark:fill-orange-400">
            {labelB}
          </text>
          <text x={sumTip.px + 4} y={sumTip.py + 12} fontSize={10} className="fill-emerald-500 dark:fill-emerald-400">
            {labelSum}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
