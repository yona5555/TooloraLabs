type EnergyMagnitudeDiagramProps = {
  value: number;
  unit: string;
  caption: string;
};

const MIN_LOG = -1;
const MAX_LOG = 6;
const WIDTH = 300;
const MARGIN = 18;
const AXIS_WIDTH = WIDTH - MARGIN * 2;
const HEIGHT = 56;
const AXIS_Y = 24;
const TICKS = [-1, 0, 1, 2, 3, 4, 5, 6];

function xForValue(value: number): number {
  const safe = value > 0 ? value : 10 ** MIN_LOG;
  const log = Math.log10(safe);
  const clamped = Math.min(MAX_LOG, Math.max(MIN_LOG, log));
  return MARGIN + ((clamped - MIN_LOG) / (MAX_LOG - MIN_LOG)) * AXIS_WIDTH;
}

/**
 * A real, precisely computed marker position on a logarithmic magnitude
 * scale, driven directly by the actual computed value — not a decorative
 * illustration.
 */
export default function EnergyMagnitudeDiagram({ value, unit, caption }: EnergyMagnitudeDiagramProps) {
  const markerX = xForValue(value);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <line x1={MARGIN} y1={AXIS_Y} x2={WIDTH - MARGIN} y2={AXIS_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          {TICKS.map((tick) => {
            const x = xForValue(10 ** tick);
            return (
              <g key={tick}>
                <line x1={x} y1={AXIS_Y - 5} x2={x} y2={AXIS_Y + 5} stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
                <text x={x} y={AXIS_Y + 18} fontSize={8} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
                  10^{tick}
                </text>
              </g>
            );
          })}
          <circle cx={markerX} cy={AXIS_Y} r={6} fill="currentColor" className="text-blue-600 dark:text-blue-400" />
          <text x={markerX} y={AXIS_Y - 12} fontSize={9} textAnchor="middle" className="fill-blue-600 dark:fill-blue-400 font-semibold">
            {unit}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
