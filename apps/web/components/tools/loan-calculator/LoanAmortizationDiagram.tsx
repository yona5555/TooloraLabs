type LoanAmortizationDiagramProps = {
  principalLabel: string;
  interestLabel: string;
  startLabel: string;
  endLabel: string;
  caption: string;
};

const WIDTH = 460;
const HEIGHT = 200;
const MARGIN_LEFT = 10;
const MARGIN_RIGHT = 10;
const MARGIN_TOP = 14;
const MARGIN_BOTTOM = 30;
const PLOT_WIDTH = WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const PLOT_HEIGHT = HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

function principalShare(t: number): number {
  // A schematic (not data-driven) curve: the principal's share of each fixed
  // payment starts small and grows as the balance — and so the interest charged on it — shrinks.
  return Math.pow(t, 0.6);
}

function buildBand(steps = 40): { top: string; bottom: string } {
  const topPoints: string[] = [];
  const bottomPoints: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = MARGIN_LEFT + t * PLOT_WIDTH;
    const principalFraction = principalShare(t);
    const boundaryY = MARGIN_TOP + PLOT_HEIGHT * (1 - principalFraction);
    topPoints.push(`${x.toFixed(1)},${(MARGIN_TOP).toFixed(1)}`);
    bottomPoints.push(`${x.toFixed(1)},${boundaryY.toFixed(1)}`);
  }
  return { top: topPoints.join(" "), bottom: bottomPoints.join(" ") };
}

const { bottom: boundaryPoints } = buildBand();

export default function LoanAmortizationDiagram({ principalLabel, interestLabel, startLabel, endLabel, caption }: LoanAmortizationDiagramProps) {
  const axisY = MARGIN_TOP + PLOT_HEIGHT;
  const interestAreaPoints = `${MARGIN_LEFT},${MARGIN_TOP} ${boundaryPoints} ${MARGIN_LEFT + PLOT_WIDTH},${MARGIN_TOP}`;
  const principalAreaPoints = `${MARGIN_LEFT},${axisY} ${boundaryPoints} ${MARGIN_LEFT + PLOT_WIDTH},${axisY}`;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 380 }}>
          <polygon points={interestAreaPoints} fill="currentColor" opacity={0.15} />
          <polygon points={principalAreaPoints} fill="currentColor" opacity={0.45} />
          <polyline points={boundaryPoints} fill="none" stroke="currentColor" strokeWidth={2} />

          <rect x={MARGIN_LEFT} y={MARGIN_TOP} width={PLOT_WIDTH} height={PLOT_HEIGHT} fill="none" stroke="currentColor" strokeWidth={1.5} />

          <text x={MARGIN_LEFT + 12} y={MARGIN_TOP + 22} fontSize={13} fontWeight={700} fill="currentColor">
            {interestLabel}
          </text>
          <text x={MARGIN_LEFT + PLOT_WIDTH - 12} y={axisY - 12} textAnchor="end" fontSize={13} fontWeight={700} fill="currentColor">
            {principalLabel}
          </text>

          <text x={MARGIN_LEFT} y={axisY + 20} fontSize={11} fill="currentColor" opacity={0.75}>
            {startLabel}
          </text>
          <text x={MARGIN_LEFT + PLOT_WIDTH} y={axisY + 20} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.75}>
            {endLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
