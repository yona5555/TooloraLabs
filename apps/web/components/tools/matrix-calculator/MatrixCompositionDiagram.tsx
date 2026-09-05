type Props = {
  b11: number;
  b12: number;
  b21: number;
  b22: number;
  product11: number;
  product12: number;
  product21: number;
  product22: number;
  labelB: string;
  labelProduct: string;
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
 * Matrix multiplication as composing two transformations: B's image of the
 * unit square (orange), and A×B's image of that same unit square (purple)
 * — the shape you get by applying A to whatever B already produced. Seeing
 * both together makes "multiply the matrices" and "apply one transformation
 * after the other" visibly the same operation.
 */
export default function MatrixCompositionDiagram({ b11, b12, b21, b22, product11, product12, product21, product22, labelB, labelProduct, caption }: Props) {
  const bQuad = quad(b11, b12, b21, b22);
  const productQuad = quad(product11, product12, product21, product22);
  const allPoints = [...bQuad, ...productQuad, { x: 1, y: 1 }];
  const maxExtent = Math.max(...allPoints.map((c) => Math.max(Math.abs(c.x), Math.abs(c.y))), 1);
  const scale = (Math.min(CENTER_X, CENTER_Y) - PADDING) / maxExtent;
  const toSvg = (x: number, y: number) => ({ px: CENTER_X + x * scale, py: CENTER_Y - y * scale });

  const unitSquare = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ].map((p) => toSvg(p.x, p.y));

  const bImage = bQuad.map((p) => toSvg(p.x, p.y));
  const productImage = productQuad.map((p) => toSvg(p.x, p.y));

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

          <polygon points={bImage.map((p) => `${p.px},${p.py}`).join(" ")} className="text-orange-500 dark:text-orange-400" fillOpacity={0.18} stroke="currentColor" strokeWidth={2} />
          <polygon points={productImage.map((p) => `${p.px},${p.py}`).join(" ")} className="text-purple-500 dark:text-purple-400" fillOpacity={0.18} stroke="currentColor" strokeWidth={2} />

          <text x={bImage[2].px + 4} y={bImage[2].py - 4} fontSize={10} className="fill-orange-500 dark:fill-orange-400">
            {labelB}
          </text>
          <text x={productImage[2].px + 4} y={productImage[2].py + 12} fontSize={10} className="fill-purple-600 dark:fill-purple-400">
            {labelProduct}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
