type PhIndicatorColorDiagramProps = {
  caption: string;
};

const BANDS = [
  { from: 0, color: "#dc2626" },
  { from: 2, color: "#f97316" },
  { from: 4, color: "#facc15" },
  { from: 6, color: "#84cc16" },
  { from: 7, color: "#22c55e" },
  { from: 8, color: "#06b6d4" },
  { from: 10, color: "#3b82f6" },
  { from: 12, color: "#6366f1" },
];

const WIDTH = 300;
const MARGIN = 10;
const AXIS_WIDTH = WIDTH - MARGIN * 2;

/**
 * A fixed illustrative universal-indicator color gradient across the 0-14
 * pH scale — the approximate colors a universal indicator solution or
 * paper turns at each pH band, not tied to any one result's numbers.
 */
export default function PhIndicatorColorDiagram({ caption }: PhIndicatorColorDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} 46`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          {BANDS.map((band, i) => {
            const nextFrom = BANDS[i + 1]?.from ?? 14;
            const x = MARGIN + (band.from / 14) * AXIS_WIDTH;
            const w = ((nextFrom - band.from) / 14) * AXIS_WIDTH;
            return <rect key={band.from} x={x} y={4} width={w} height={16} fill={band.color} />;
          })}
          {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((tick) => (
            <text key={tick} x={MARGIN + (tick / 14) * AXIS_WIDTH} y={34} fontSize={9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
              {tick}
            </text>
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
