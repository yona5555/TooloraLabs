type TriangleAnatomyDiagramProps = {
  labelA: string;
  labelB: string;
  labelC: string;
  labelAngleA: string;
  labelAngleB: string;
  labelAngleC: string;
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 190;

const P_A = { x: 30, y: 160 };
const P_B = { x: 230, y: 160 };
const P_C = { x: 110, y: 30 };

export default function TriangleAnatomyDiagram({ labelA, labelB, labelC, labelAngleA, labelAngleB, labelAngleC, caption }: TriangleAnatomyDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-64 text-current" style={{ minWidth: 220 }}>
          <polygon
            points={`${P_A.x},${P_A.y} ${P_B.x},${P_B.y} ${P_C.x},${P_C.y}`}
            className="fill-blue-500/15 dark:fill-blue-400/15"
            stroke="currentColor"
            strokeWidth={2}
          />
          <text x={(P_A.x + P_B.x) / 2} y={P_A.y + 18} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
            {labelC}
          </text>
          <text x={(P_B.x + P_C.x) / 2 + 14} y={(P_B.y + P_C.y) / 2} textAnchor="start" fontSize={11} fontWeight={700} fill="currentColor">
            {labelA}
          </text>
          <text x={(P_A.x + P_C.x) / 2 - 14} y={(P_A.y + P_C.y) / 2} textAnchor="end" fontSize={11} fontWeight={700} fill="currentColor">
            {labelB}
          </text>
          <text x={P_A.x} y={P_A.y + 2} textAnchor="end" fontSize={10} className="fill-blue-600 dark:fill-blue-400">
            {labelAngleA}
          </text>
          <text x={P_B.x} y={P_B.y + 2} textAnchor="start" fontSize={10} className="fill-blue-600 dark:fill-blue-400">
            {labelAngleB}
          </text>
          <text x={P_C.x} y={P_C.y - 8} textAnchor="middle" fontSize={10} className="fill-blue-600 dark:fill-blue-400">
            {labelAngleC}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
