type MatrixAnatomyDiagramProps = {
  a11: number;
  a12: number;
  a21: number;
  a22: number;
  determinant: number;
  inv11: number;
  inv12: number;
  inv21: number;
  inv22: number;
  labelMatrix: string;
  labelDeterminant: string;
  labelInverse: string;
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 150;
const CELL = 40;

function Grid({ x, y, values }: { x: number; y: number; values: [number, number, number, number] }) {
  return (
    <g>
      <rect x={x} y={y} width={CELL * 2} height={CELL * 2} rx={8} className="fill-none stroke-blue-300 dark:stroke-blue-500/40" strokeWidth={1.5} />
      <line x1={x + CELL} y1={y} x2={x + CELL} y2={y + CELL * 2} className="stroke-blue-200 dark:stroke-blue-500/25" strokeWidth={1} />
      <line x1={x} y1={y + CELL} x2={x + CELL * 2} y2={y + CELL} className="stroke-blue-200 dark:stroke-blue-500/25" strokeWidth={1} />
      {[values[0], values[1], values[2], values[3]].map((v, i) => (
        <text
          key={i}
          x={x + CELL * (i % 2) + CELL / 2}
          y={y + CELL * Math.floor(i / 2) + CELL / 2 + 4}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="currentColor"
        >
          {v}
        </text>
      ))}
    </g>
  );
}

export default function MatrixAnatomyDiagram({
  a11,
  a12,
  a21,
  a22,
  determinant,
  inv11,
  inv12,
  inv21,
  inv22,
  labelMatrix,
  labelDeterminant,
  labelInverse,
  caption,
}: MatrixAnatomyDiagramProps) {
  const gridY = 30;
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-80 text-current" style={{ minWidth: 280 }}>
          <text x={30} y={16} fontSize={11} fontWeight={700} fill="currentColor">
            {labelMatrix}
          </text>
          <Grid x={10} y={gridY} values={[a11, a12, a21, a22]} />

          <text x={100} y={gridY + CELL + 4} textAnchor="middle" fontSize={14} fill="currentColor" opacity={0.6}>
            →
          </text>

          <text x={115} y={16} fontSize={11} fontWeight={700} fill="currentColor">
            {labelDeterminant}
          </text>
          <text x={140} y={gridY + CELL + 5} textAnchor="middle" fontSize={16} fontWeight={700} className="fill-purple-600 dark:fill-purple-400">
            {determinant}
          </text>

          <text x={165} y={gridY + CELL + 4} textAnchor="middle" fontSize={14} fill="currentColor" opacity={0.6}>
            →
          </text>

          <text x={220} y={16} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
            {labelInverse}
          </text>
          <Grid x={180} y={gridY} values={[inv11, inv12, inv21, inv22]} />
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
