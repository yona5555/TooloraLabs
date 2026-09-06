type ScalingCurveDiagramProps = {
  points: { x: number; y: number }[];
  xLabel: string;
  yLabel: string;
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 170;
const MARGIN = { top: 14, right: 12, bottom: 32, left: 12 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

export default function ScalingCurveDiagram({ points, xLabel, yLabel, caption }: ScalingCurveDiagramProps) {
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y), minY + 1);

  const xAt = (x: number) => MARGIN.left + ((x - minX) / Math.max(maxX - minX, 1)) * PLOT_WIDTH;
  const yAt = (y: number) => MARGIN.top + PLOT_HEIGHT - ((y - minY) / Math.max(maxY - minY, 1)) * PLOT_HEIGHT;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.x).toFixed(1)} ${yAt(p.y).toFixed(1)}`).join(" ");

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-72 text-current" style={{ minWidth: 260 }}>
          <line x1={MARGIN.left} y1={MARGIN.top + PLOT_HEIGHT} x2={WIDTH - MARGIN.right} y2={MARGIN.top + PLOT_HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <path d={pathD} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
          {points.map((p, i) => (
            <circle key={i} cx={xAt(p.x)} cy={yAt(p.y)} r={3} className="fill-blue-600 dark:fill-blue-400" />
          ))}
          <text x={MARGIN.left} y={HEIGHT - 18} fontSize={10} fill="currentColor" opacity={0.6}>
            {points[0].x}
          </text>
          <text x={WIDTH - MARGIN.right} y={HEIGHT - 18} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>
            {points[points.length - 1].x}
          </text>
          <text x={WIDTH / 2} y={HEIGHT - 18} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.6}>
            {xLabel}
          </text>
          <text x={MARGIN.left} y={MARGIN.top - 2} fontSize={9} fill="currentColor" opacity={0.6}>
            {yLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
