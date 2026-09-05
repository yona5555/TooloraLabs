type Props = {
  a11: number;
  a12: number;
  a21: number;
  a22: number;
  inverseA11: number | null;
  inverseA12: number | null;
  inverseA21: number | null;
  inverseA22: number | null;
  labelA: string;
  labelInverse: string;
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 220;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const PADDING = 30;

function quad(m11: number, m12: number, m21: number, m22: number) {
  return [
    { x: 0, y: 0 },
    { x: m11, y: m21 },
    { x: m11 + m12, y: m21 + m22 },
    { x: m12, y: m22 },
  ];
}

/**
 * A's image of the unit square (blue) alongside A⁻¹'s image of the unit
 * square (teal) — two different parallelograms that are each other's
 * "undo": feeding A's parallelogram back through A⁻¹ collapses it exactly
 * onto the dashed unit square, which is what A×A⁻¹ = identity means
 * geometrically. Hidden when A has no inverse (a zero determinant).
 */
export default function MatrixInverseDiagram({ a11, a12, a21, a22, inverseA11, inverseA12, inverseA21, inverseA22, labelA, labelInverse, caption }: Props) {
  const hasInverse = inverseA11 !== null && inverseA12 !== null && inverseA21 !== null && inverseA22 !== null;
  const aQuad = quad(a11, a12, a21, a22);
  const invQuad = hasInverse ? quad(inverseA11 as number, inverseA12 as number, inverseA21 as number, inverseA22 as number) : [];
  const allPoints = [...aQuad, ...invQuad, { x: 1, y: 1 }];
  const maxExtent = Math.max(...allPoints.map((c) => Math.max(Math.abs(c.x), Math.abs(c.y))), 1);
  const scale = (Math.min(CENTER_X, CENTER_Y) - PADDING) / maxExtent;
  const toSvg = (x: number, y: number) => ({ px: CENTER_X + x * scale, py: CENTER_Y - y * scale });

  const unitSquare = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ].map((p) => toSvg(p.x, p.y));

  const aImage = aQuad.map((p) => toSvg(p.x, p.y));
  const invImage = invQuad.map((p) => toSvg(p.x, p.y));

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs">
          <line x1={0} y1={CENTER_Y} x2={WIDTH} y2={CENTER_Y} stroke="currentColor" strokeWidth={1} opacity={0.15} />
          <line x1={CENTER_X} y1={0} x2={CENTER_X} y2={HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.15} />

          <polygon
            points={unitSquare.map((p) => `${p.px},${p.py}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            className="text-zinc-400 dark:text-zinc-500"
          />

          <polygon points={aImage.map((p) => `${p.px},${p.py}`).join(" ")} className="text-blue-600 dark:text-blue-400" fillOpacity={0.18} stroke="currentColor" strokeWidth={2} />
          {hasInverse && (
            <polygon points={invImage.map((p) => `${p.px},${p.py}`).join(" ")} className="text-teal-500 dark:text-teal-400" fillOpacity={0.18} stroke="currentColor" strokeWidth={2} />
          )}

          <text x={aImage[2].px + 4} y={aImage[2].py - 4} fontSize={10} className="fill-blue-600 dark:fill-blue-400">
            {labelA}
          </text>
          {hasInverse && (
            <text x={invImage[2].px + 4} y={invImage[2].py + 12} fontSize={10} className="fill-teal-600 dark:fill-teal-400">
              {labelInverse}
            </text>
          )}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
