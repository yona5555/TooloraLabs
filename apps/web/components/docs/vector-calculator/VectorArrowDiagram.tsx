type VectorArrowDiagramProps = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  labelA: string;
  labelB: string;
  labelSum: string;
  caption: string;
};

const WIDTH = 300;
const HEIGHT = 220;
const ORIGIN_X = 40;
const ORIGIN_Y = 190;
const SCALE = 20;

function toSvg(x: number, y: number) {
  return { x: ORIGIN_X + x * SCALE, y: ORIGIN_Y - y * SCALE };
}

function Arrow({ x, y, colorClass, markerId }: { x: number; y: number; colorClass: string; markerId: string }) {
  const end = toSvg(x, y);
  return <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={end.x} y2={end.y} strokeWidth={2.5} className={colorClass} markerEnd={`url(#${markerId})`} />;
}

export default function VectorArrowDiagram({ ax, ay, bx, by, labelA, labelB, labelSum, caption }: VectorArrowDiagramProps) {
  const sumEnd = toSvg(ax + bx, ay + by);
  const aEnd = toSvg(ax, ay);
  const bEnd = toSvg(bx, by);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-72 text-current" style={{ minWidth: 260 }}>
          <line x1={0} y1={ORIGIN_Y} x2={WIDTH} y2={ORIGIN_Y} stroke="currentColor" strokeWidth={1} opacity={0.2} />
          <line x1={ORIGIN_X} y1={0} x2={ORIGIN_X} y2={HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.2} />

          {/* Parallelogram guide showing A+B as the diagonal */}
          <line x1={aEnd.x} y1={aEnd.y} x2={sumEnd.x} y2={sumEnd.y} strokeWidth={1} strokeDasharray="3 3" className="stroke-zinc-300 dark:stroke-zinc-600" />
          <line x1={bEnd.x} y1={bEnd.y} x2={sumEnd.x} y2={sumEnd.y} strokeWidth={1} strokeDasharray="3 3" className="stroke-zinc-300 dark:stroke-zinc-600" />

          <Arrow x={ax} y={ay} colorClass="stroke-blue-600 dark:stroke-blue-400" markerId="vec-arrow-a" />
          <Arrow x={bx} y={by} colorClass="stroke-emerald-500 dark:stroke-emerald-400" markerId="vec-arrow-b" />
          <Arrow x={ax + bx} y={ay + by} colorClass="stroke-purple-500 dark:stroke-purple-400" markerId="vec-arrow-sum" />

          <text x={aEnd.x + 6} y={aEnd.y - 4} fontSize={11} fontWeight={700} className="fill-blue-600 dark:fill-blue-400">
            {labelA}
          </text>
          <text x={bEnd.x + 6} y={bEnd.y - 4} fontSize={11} fontWeight={700} className="fill-emerald-600 dark:fill-emerald-400">
            {labelB}
          </text>
          <text x={sumEnd.x + 6} y={sumEnd.y + 12} fontSize={11} fontWeight={700} className="fill-purple-600 dark:fill-purple-400">
            {labelSum}
          </text>

          <defs>
            <marker id="vec-arrow-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-blue-600 dark:fill-blue-400" />
            </marker>
            <marker id="vec-arrow-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-emerald-500 dark:fill-emerald-400" />
            </marker>
            <marker id="vec-arrow-sum" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-purple-500 dark:fill-purple-400" />
            </marker>
          </defs>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
