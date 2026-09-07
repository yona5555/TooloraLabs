type DotPlotDiagramProps = {
  values: number[];
  markers: { value: number; label: string; colorClass: string }[];
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 100;
const MARGIN = { top: 10, right: 16, bottom: 34, left: 16 };
const DOT_R = 4;
const ROW_HEIGHT = 10;
const BASELINE_Y = HEIGHT - MARGIN.bottom;

export default function DotPlotDiagram({ values, markers, caption }: DotPlotDiagramProps) {
  const min = Math.min(...values, ...markers.map((m) => m.value));
  const max = Math.max(...values, ...markers.map((m) => m.value));
  const span = Math.max(max - min, 1);
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
  const xAt = (v: number) => MARGIN.left + ((v - min) / span) * plotWidth;

  // Stack dots that land at (nearly) the same x position so they don't overlap.
  const sorted = [...values].sort((a, b) => a - b);
  const bucketCounts = new Map<number, number>();
  const stacked = sorted.map((v) => {
    const bucketKey = Math.round(xAt(v));
    const stackIndex = bucketCounts.get(bucketKey) ?? 0;
    bucketCounts.set(bucketKey, stackIndex + 1);
    return { x: xAt(v), y: BASELINE_Y - 6 - stackIndex * ROW_HEIGHT };
  });

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-72 text-current" style={{ minWidth: 260 }}>
          <line x1={MARGIN.left} y1={BASELINE_Y} x2={WIDTH - MARGIN.right} y2={BASELINE_Y} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          {stacked.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={DOT_R} className="fill-zinc-400 dark:fill-zinc-500" />
          ))}
          {markers.map((m) => (
            <g key={m.label}>
              <line x1={xAt(m.value)} y1={MARGIN.top} x2={xAt(m.value)} y2={BASELINE_Y} strokeWidth={2} className={m.colorClass} />
              <text x={xAt(m.value)} y={BASELINE_Y + 14} textAnchor="middle" fontSize={9} fontWeight={700} className={m.colorClass}>
                {m.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
