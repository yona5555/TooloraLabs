type MetricLadderDiagramProps = {
  caption: string;
};

const STEPS = [
  { label: "milli", symbol: "m", power: "10⁻³" },
  { label: "centi", symbol: "c", power: "10⁻²" },
  { label: "deci", symbol: "d", power: "10⁻¹" },
  { label: "(base)", symbol: "—", power: "10⁰" },
  { label: "deca", symbol: "da", power: "10¹" },
  { label: "hecto", symbol: "h", power: "10²" },
  { label: "kilo", symbol: "k", power: "10³" },
];

const WIDTH = 560;
const HEIGHT = 220;
const STEP_W = WIDTH / STEPS.length;
const BASE_Y = 170;
const STEP_RISE = 16;

export default function MetricLadderDiagram({ caption }: MetricLadderDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={caption}
          className="h-auto w-full text-current"
          style={{ minWidth: 480 }}
        >
          {STEPS.map((step, i) => {
            const isBase = step.label === "(base)";
            const x = i * STEP_W;
            const barHeight = 10 + Math.abs(i - 3) * STEP_RISE;
            const y = BASE_Y - barHeight;
            return (
              <g key={step.label}>
                <rect
                  x={x + 6}
                  y={y}
                  width={STEP_W - 12}
                  height={barHeight}
                  fill="currentColor"
                  opacity={isBase ? 0.85 : 0.25 + (0.5 * Math.abs(i - 3)) / 3}
                  stroke="currentColor"
                  strokeWidth={1}
                />
                <text x={x + STEP_W / 2} y={y - 8} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
                  {step.power}
                </text>
                <text x={x + STEP_W / 2} y={BASE_Y + 20} textAnchor="middle" fontSize={11} fontWeight={isBase ? 700 : 500} fill="currentColor">
                  {step.label}
                </text>
                <text x={x + STEP_W / 2} y={BASE_Y + 36} textAnchor="middle" fontSize={10} opacity={0.7} fill="currentColor">
                  {step.symbol}
                </text>
              </g>
            );
          })}
          <line x1={0} y1={BASE_Y} x2={WIDTH} y2={BASE_Y} stroke="currentColor" strokeWidth={1} opacity={0.4} />
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
