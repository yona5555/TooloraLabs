import type { GraphPoint } from "./types";

type Props = {
  points: GraphPoint[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

const WIDTH = 600;
const HEIGHT = 340;
const PAD = 28;

export default function GraphCanvas({ points, xMin, xMax, yMin, yMax }: Props) {
  const plotW = WIDTH - PAD * 2;
  const plotH = HEIGHT - PAD * 2;

  const rangeY = yMax - yMin || 1;
  const rangeX = xMax - xMin || 1;

  const mapX = (x: number) => PAD + ((x - xMin) / rangeX) * plotW;
  const mapY = (y: number) => PAD + plotH - ((y - yMin) / rangeY) * plotH;

  const segments: string[] = [];
  let current: string[] = [];
  for (const point of points) {
    if (point.y === null) {
      if (current.length > 1) segments.push(current.join(" "));
      current = [];
      continue;
    }
    current.push(`${mapX(point.x).toFixed(2)},${mapY(point.y).toFixed(2)}`);
  }
  if (current.length > 1) segments.push(current.join(" "));

  const showXAxis = yMin <= 0 && yMax >= 0;
  const showYAxis = xMin <= 0 && xMax >= 0;

  return (
    <div dir="ltr">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <rect x={PAD} y={PAD} width={plotW} height={plotH} fill="none" stroke="currentColor" className="text-zinc-200 dark:text-zinc-700" />

        {showYAxis && (
          <line x1={mapX(0)} y1={PAD} x2={mapX(0)} y2={PAD + plotH} stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" strokeWidth={1} />
        )}
        {showXAxis && (
          <line x1={PAD} y1={mapY(0)} x2={PAD + plotW} y2={mapY(0)} stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" strokeWidth={1} />
        )}

        {segments.map((d, i) => (
          <polyline key={i} points={d} fill="none" stroke="#2563eb" strokeWidth={2} />
        ))}

        <text x={PAD} y={HEIGHT - 6} fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
          {xMin.toFixed(2)}
        </text>
        <text x={WIDTH - PAD} y={HEIGHT - 6} fontSize={11} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
          {xMax.toFixed(2)}
        </text>
        <text x={2} y={PAD + 4} fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
          {yMax.toFixed(2)}
        </text>
        <text x={2} y={HEIGHT - PAD} fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
          {yMin.toFixed(2)}
        </text>
      </svg>
    </div>
  );
}
