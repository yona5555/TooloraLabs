type Props = {
  a11: number;
  a12: number;
  a21: number;
  a22: number;
  fmt: (value: number) => string;
  caption: string;
};

const CELL = 56;
const GAP = 4;
const GRID = CELL * 2 + GAP;
const WIDTH = GRID;
const HEIGHT = GRID + 30;

/**
 * Not a coordinate-plane picture like the others on this page — a direct
 * schematic of the transpose operation itself. The diagonal entries
 * (a11, a22) stay put; the two off-diagonal entries (a12, a21) swap places
 * across that diagonal, traced here with a curved arrow between them.
 */
export default function MatrixTransposeDiagram({ a11, a12, a21, a22, fmt, caption }: Props) {
  const cellCenter = (row: number, col: number) => ({
    x: col * (CELL + GAP) + CELL / 2,
    y: row * (CELL + GAP) + CELL / 2,
  });

  const c11 = cellCenter(0, 0);
  const c12 = cellCenter(0, 1);
  const c21 = cellCenter(1, 0);
  const c22 = cellCenter(1, 1);

  const diagonalClass = "fill-zinc-100 dark:fill-zinc-800";
  const swapClass = "fill-blue-500/15 dark:fill-blue-400/15";

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-[220px]">
          <rect x={0} y={0} width={CELL} height={CELL} rx={6} className={diagonalClass} stroke="currentColor" strokeWidth={1} />
          <rect x={CELL + GAP} y={0} width={CELL} height={CELL} rx={6} className={swapClass} stroke="currentColor" strokeWidth={1.5} />
          <rect x={0} y={CELL + GAP} width={CELL} height={CELL} rx={6} className={swapClass} stroke="currentColor" strokeWidth={1.5} />
          <rect x={CELL + GAP} y={CELL + GAP} width={CELL} height={CELL} rx={6} className={diagonalClass} stroke="currentColor" strokeWidth={1} />

          <text x={c11.x} y={c11.y + 4} fontSize={13} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">
            {fmt(a11)}
          </text>
          <text x={c12.x} y={c12.y + 4} fontSize={13} textAnchor="middle" fontWeight={700} className="fill-blue-600 dark:fill-blue-400">
            {fmt(a12)}
          </text>
          <text x={c21.x} y={c21.y + 4} fontSize={13} textAnchor="middle" fontWeight={700} className="fill-blue-600 dark:fill-blue-400">
            {fmt(a21)}
          </text>
          <text x={c22.x} y={c22.y + 4} fontSize={13} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">
            {fmt(a22)}
          </text>

          <path
            d={`M ${c12.x - 8} ${c12.y + 10} Q ${(c12.x + c21.x) / 2} ${(c12.y + c21.y) / 2} ${c21.x + 10} ${c21.y - 8}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-blue-500 dark:text-blue-400"
            markerEnd="url(#transpose-arrow)"
          />
          <path
            d={`M ${c21.x + 10} ${c21.y - 8} Q ${(c12.x + c21.x) / 2} ${(c12.y + c21.y) / 2} ${c12.x - 8} ${c12.y + 10}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-blue-500 dark:text-blue-400"
            markerEnd="url(#transpose-arrow)"
          />
          <defs>
            <marker id="transpose-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-blue-500 dark:fill-blue-400" />
            </marker>
          </defs>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
