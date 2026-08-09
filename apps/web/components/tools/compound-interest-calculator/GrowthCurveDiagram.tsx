type GrowthCurveDiagramProps = {
  simpleLabel: string;
  compoundLabel: string;
  timeLabel: string;
  valueLabel: string;
  caption: string;
};

const WIDTH = 460;
const HEIGHT = 240;
const MARGIN_LEFT = 36;
const MARGIN_BOTTOM = 30;
const MARGIN_TOP = 14;
const MARGIN_RIGHT = 14;
const PLOT_WIDTH = WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const PLOT_HEIGHT = HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

function buildPoints(fn: (t: number) => number, steps = 40): string {
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = MARGIN_LEFT + t * PLOT_WIDTH;
    const y = MARGIN_TOP + PLOT_HEIGHT - fn(t) * PLOT_HEIGHT;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

// Simple interest: linear growth. Compound interest: exponential growth, normalized to the same start/end range for a clear visual contrast.
const simplePoints = buildPoints((t) => 0.05 + t * 0.55);
const compoundPoints = buildPoints((t) => 0.05 + (Math.pow(1.9, t) - 1) / (1.9 - 1) * 0.85);

export default function GrowthCurveDiagram({ simpleLabel, compoundLabel, timeLabel, valueLabel, caption }: GrowthCurveDiagramProps) {
  const axisY = MARGIN_TOP + PLOT_HEIGHT;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 380 }}>
          {/* axes */}
          <line x1={MARGIN_LEFT} y1={MARGIN_TOP} x2={MARGIN_LEFT} y2={axisY} stroke="currentColor" strokeWidth={1.5} />
          <line x1={MARGIN_LEFT} y1={axisY} x2={MARGIN_LEFT + PLOT_WIDTH} y2={axisY} stroke="currentColor" strokeWidth={1.5} />
          <text x={MARGIN_LEFT - 10} y={MARGIN_TOP + 6} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.75}>
            {valueLabel}
          </text>
          <text x={MARGIN_LEFT + PLOT_WIDTH} y={axisY + 20} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.75}>
            {timeLabel}
          </text>

          {/* simple interest: dashed straight line */}
          <polyline points={simplePoints} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="5 4" opacity={0.6} />

          {/* compound interest: solid curve */}
          <polyline points={compoundPoints} fill="none" stroke="currentColor" strokeWidth={2.5} />

          {/* end-point labels */}
          <text x={MARGIN_LEFT + PLOT_WIDTH + 0} y={MARGIN_TOP + PLOT_HEIGHT - 0.85 * PLOT_HEIGHT - 6} textAnchor="end" fontSize={12} fontWeight={700} fill="currentColor">
            {compoundLabel}
          </text>
          <text x={MARGIN_LEFT + PLOT_WIDTH + 0} y={MARGIN_TOP + PLOT_HEIGHT - 0.55 * PLOT_HEIGHT + 16} textAnchor="end" fontSize={12} fill="currentColor" opacity={0.75}>
            {simpleLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
