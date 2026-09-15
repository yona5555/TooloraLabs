type Props = {
  a11: number;
  a12: number;
  a21: number;
  a22: number;
  fmt: (v: number) => string;
  caption: string;
};

const CELL = 56;
const PAD = 24;
const WIDTH = CELL * 2 + PAD * 2;
const HEIGHT = CELL * 2 + PAD * 2 + 34;

/**
 * The literal cross-multiplication arithmetic behind det(A) = a11*a22 - a12*a21
 * for a 2x2 matrix — complements MatrixTransformDiagram (which shows the
 * geometric "why": determinant as the scaled area of the unit square) with
 * the arithmetic "how": which two diagonal products are multiplied, and that
 * the second one is subtracted, not added.
 */
export default function MatrixDeterminantArithmeticDiagram({ a11, a12, a21, a22, fmt, caption }: Props) {
  const x0 = PAD;
  const x1 = PAD + CELL;
  const y0 = PAD;
  const y1 = PAD + CELL;
  const cx = (x0 + x1 + CELL) / 2;
  const det = a11 * a22 - a12 * a21;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs">
          <rect x={x0} y={y0} width={CELL * 2} height={CELL * 2} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-zinc-400 dark:text-zinc-500" />
          <line x1={x1} y1={y0} x2={x1} y2={y1 + CELL} stroke="currentColor" strokeWidth={1} opacity={0.2} />
          <line x1={x0} y1={y1} x2={x1 + CELL} y2={y1} stroke="currentColor" strokeWidth={1} opacity={0.2} />

          {/* main diagonal (a11, a22) — positive product */}
          <line x1={x0 + CELL / 2} y1={y0 + CELL / 2} x2={x1 + CELL / 2} y2={y1 + CELL / 2} className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth={2.5} markerEnd="url(#detArrow)" />
          {/* anti-diagonal (a12, a21) — subtracted product */}
          <line x1={x1 + CELL / 2} y1={y0 + CELL / 2} x2={x0 + CELL / 2} y2={y1 + CELL / 2} className="stroke-red-500 dark:stroke-red-400" strokeWidth={2.5} strokeDasharray="4 3" />

          <defs>
            <marker id="detArrow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-emerald-500 dark:fill-emerald-400" />
            </marker>
          </defs>

          <text x={x0 + CELL / 2} y={y0 + CELL / 2 - 8} textAnchor="middle" fontSize={13} fontWeight={600} className="fill-zinc-900 dark:fill-zinc-100">{fmt(a11)}</text>
          <text x={x1 + CELL / 2} y={y0 + CELL / 2 - 8} textAnchor="middle" fontSize={13} fontWeight={600} className="fill-red-600 dark:fill-red-400">{fmt(a12)}</text>
          <text x={x0 + CELL / 2} y={y1 + CELL / 2 + 18} textAnchor="middle" fontSize={13} fontWeight={600} className="fill-red-600 dark:fill-red-400">{fmt(a21)}</text>
          <text x={x1 + CELL / 2} y={y1 + CELL / 2 + 18} textAnchor="middle" fontSize={13} fontWeight={600} className="fill-zinc-900 dark:fill-zinc-100">{fmt(a22)}</text>

          <text x={cx} y={HEIGHT - 6} textAnchor="middle" fontSize={12} className="fill-zinc-700 dark:fill-zinc-300">
            <tspan className="fill-emerald-600 dark:fill-emerald-400">{fmt(a11)}×{fmt(a22)}</tspan>
            <tspan> − </tspan>
            <tspan className="fill-red-600 dark:fill-red-400">{fmt(a12)}×{fmt(a21)}</tspan>
            <tspan> = {fmt(det)}</tspan>
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
