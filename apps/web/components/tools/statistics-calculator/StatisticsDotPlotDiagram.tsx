type StatisticsDotPlotDiagramProps = {
  values: number[];
  mean: number;
  median: number;
  meanLabel: string;
  medianLabel: string;
  caption: string;
};

const WIDTH = 340;
const MARGIN = 20;
const AXIS_WIDTH = WIDTH - MARGIN * 2;
const AXIS_Y = 70;
const DOT_ROW_HEIGHT = 10;
const HEIGHT = 100;

/**
 * A real dot plot of the entered data set — every point is drawn at its
 * actual value, with the exact computed mean and median marked — not a
 * decorative illustration.
 */
export default function StatisticsDotPlotDiagram({ values, mean, median, meanLabel, medianLabel, caption }: StatisticsDotPlotDiagramProps) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const padding = span > 0 ? span * 0.15 : 1;
  const domainMin = min - padding;
  const domainMax = max + padding;

  function xFor(value: number): number {
    return MARGIN + ((value - domainMin) / (domainMax - domainMin)) * AXIS_WIDTH;
  }

  const stackCounts = new Map<number, number>();
  const dots = values.map((value) => {
    const x = Math.round(xFor(value));
    const stack = stackCounts.get(x) ?? 0;
    stackCounts.set(x, stack + 1);
    return { x, y: AXIS_Y - 8 - stack * DOT_ROW_HEIGHT };
  });

  const meanX = xFor(mean);
  const medianX = xFor(median);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <line x1={MARGIN} y1={AXIS_Y} x2={WIDTH - MARGIN} y2={AXIS_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          {dots.map((dot, index) => (
            <circle key={index} cx={dot.x} cy={dot.y} r={3.5} className="fill-zinc-500 dark:fill-zinc-400" />
          ))}
          <line
            x1={medianX}
            y1={AXIS_Y - 2}
            x2={medianX}
            y2={AXIS_Y + 22}
            stroke="currentColor"
            strokeWidth={2}
            className="text-orange-500 dark:text-orange-400"
          />
          <text x={medianX} y={AXIS_Y + 32} fontSize={8} textAnchor="middle" className="fill-orange-600 dark:fill-orange-400">
            {medianLabel}
          </text>
          <polygon
            points={`${meanX - 5},${AXIS_Y + 12} ${meanX + 5},${AXIS_Y + 12} ${meanX},${AXIS_Y + 4}`}
            className="fill-blue-600 dark:fill-blue-400"
          />
          <text x={meanX} y={AXIS_Y + 44} fontSize={8} textAnchor="middle" className="fill-blue-600 dark:fill-blue-400">
            {meanLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
