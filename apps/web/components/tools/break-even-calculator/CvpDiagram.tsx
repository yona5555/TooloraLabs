type CvpDiagramProps = {
  fixedLabel: string;
  totalCostLabel: string;
  revenueLabel: string;
  profitLabel: string;
  lossLabel: string;
  caption: string;
};

const WIDTH = 480;
const HEIGHT = 220;
const PAD = 30;

export default function CvpDiagram({ fixedLabel, totalCostLabel, revenueLabel, profitLabel, lossLabel, caption }: CvpDiagramProps) {
  const plotW = WIDTH - PAD * 2;
  const plotH = HEIGHT - PAD * 2;
  // Illustrative fixed geometry: revenue line steeper than total-cost line, crossing at ~55% of the x-axis.
  const beX = PAD + plotW * 0.55;
  const beY = PAD + plotH * 0.45;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 420 }}>
          <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + plotH} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <line x1={PAD} y1={PAD + plotH} x2={WIDTH - PAD} y2={PAD + plotH} stroke="currentColor" strokeWidth={1} opacity={0.3} />

          {/* loss zone shading */}
          <polygon
            points={`${PAD},${PAD + plotH} ${PAD},${PAD + plotH * 0.75} ${beX},${beY} ${PAD},${PAD + plotH}`}
            fill="currentColor"
            opacity={0.08}
          />
          {/* profit zone shading */}
          <polygon
            points={`${beX},${beY} ${WIDTH - PAD},${PAD + plotH * 0.05} ${WIDTH - PAD},${PAD + plotH} ${beX},${beY}`}
            fill="currentColor"
            opacity={0.14}
          />

          {/* fixed cost line */}
          <line x1={PAD} y1={PAD + plotH * 0.75} x2={WIDTH - PAD} y2={PAD + plotH * 0.75} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
          {/* total cost line */}
          <line x1={PAD} y1={PAD + plotH * 0.75} x2={WIDTH - PAD} y2={PAD + plotH * 0.15} stroke="currentColor" strokeWidth={2} opacity={0.6} />
          {/* revenue line */}
          <line x1={PAD} y1={PAD + plotH} x2={WIDTH - PAD} y2={PAD + plotH * 0.05} stroke="currentColor" strokeWidth={2} />

          <circle cx={beX} cy={beY} r={4} fill="currentColor" />

          <text x={PAD + 4} y={PAD + plotH * 0.75 - 6} fontSize={11} fill="currentColor" opacity={0.7}>
            {fixedLabel}
          </text>
          <text x={WIDTH - PAD - 4} y={PAD + plotH * 0.15 - 6} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.8}>
            {totalCostLabel}
          </text>
          <text x={WIDTH - PAD - 4} y={PAD + plotH * 0.05 + 14} textAnchor="end" fontSize={11} fill="currentColor">
            {revenueLabel}
          </text>
          <text x={beX + 40} y={beY - 25} fontSize={11} fontWeight={700} fill="currentColor">
            {profitLabel}
          </text>
          <text x={PAD + 20} y={PAD + plotH - 20} fontSize={11} fontWeight={700} fill="currentColor">
            {lossLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
