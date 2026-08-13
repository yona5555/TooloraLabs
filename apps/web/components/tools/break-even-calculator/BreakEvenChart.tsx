type BreakEvenChartProps = {
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
  breakEvenUnits: number;
  fixedCostsLabel: string;
  totalCostLabel: string;
  revenueLabel: string;
  breakEvenLabel: string;
};

const WIDTH = 320;
const HEIGHT = 220;
const PAD_LEFT = 8;
const PAD_BOTTOM = 22;
const PAD_TOP = 10;
const PAD_RIGHT = 8;

export default function BreakEvenChart({
  fixedCosts,
  variableCostPerUnit,
  pricePerUnit,
  breakEvenUnits,
  fixedCostsLabel,
  totalCostLabel,
  revenueLabel,
  breakEvenLabel,
}: BreakEvenChartProps) {
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  // Show a bit beyond the break-even point so the crossing is visible.
  const maxUnits = Math.max(breakEvenUnits * 1.6, 10);
  const maxValue = Math.max(fixedCosts + variableCostPerUnit * maxUnits, pricePerUnit * maxUnits, 1);

  const xFor = (units: number) => PAD_LEFT + (units / maxUnits) * plotW;
  const yFor = (value: number) => PAD_TOP + plotH - (value / maxValue) * plotH;

  const totalCostAtMax = fixedCosts + variableCostPerUnit * maxUnits;
  const revenueAtMax = pricePerUnit * maxUnits;

  const beX = xFor(breakEvenUnits);
  const beY = yFor(fixedCosts + variableCostPerUnit * breakEvenUnits);

  return (
    <figure className="my-1">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={breakEvenLabel} className="h-auto w-full text-current" style={{ minWidth: 280 }}>
          {/* axes */}
          <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={PAD_TOP + plotH} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="currentColor" strokeWidth={1} opacity={0.3} />

          {/* fixed costs line (flat) */}
          <line
            x1={xFor(0)}
            y1={yFor(fixedCosts)}
            x2={xFor(maxUnits)}
            y2={yFor(fixedCosts)}
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.4}
          />

          {/* total cost line */}
          <line x1={xFor(0)} y1={yFor(fixedCosts)} x2={xFor(maxUnits)} y2={yFor(totalCostAtMax)} stroke="currentColor" strokeWidth={2} opacity={0.55} />

          {/* revenue line */}
          <line x1={xFor(0)} y1={yFor(0)} x2={xFor(maxUnits)} y2={yFor(revenueAtMax)} stroke="currentColor" strokeWidth={2} opacity={0.9} />

          {/* break-even marker */}
          <line x1={beX} y1={PAD_TOP} x2={beX} y2={PAD_TOP + plotH} stroke="currentColor" strokeWidth={1} strokeDasharray="2 2" opacity={0.4} />
          <circle cx={beX} cy={beY} r={4} fill="currentColor" />

          <text x={xFor(0) + 2} y={yFor(fixedCosts) - 4} fontSize={9} fill="currentColor" opacity={0.7}>
            {fixedCostsLabel}
          </text>
          <text x={xFor(maxUnits) - 2} y={yFor(totalCostAtMax) - 6} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.8}>
            {totalCostLabel}
          </text>
          <text x={xFor(maxUnits) - 2} y={yFor(revenueAtMax) + 12} textAnchor="end" fontSize={9} fill="currentColor">
            {revenueLabel}
          </text>
          <text x={beX} y={PAD_TOP + plotH + 14} textAnchor="middle" fontSize={9} fontWeight={700} fill="currentColor">
            {breakEvenUnits}
          </text>
        </svg>
      </div>
      <figcaption className="mt-1 text-center text-xs opacity-70">{breakEvenLabel}</figcaption>
    </figure>
  );
}
