type BreakEvenChartDiagramProps = {
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
  breakEvenUnits: number;
  maxUnits: number;
  labelRevenue: string;
  labelCost: string;
  labelBreakEven: string;
  caption: string;
};

const WIDTH = 360;
const HEIGHT = 220;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 44 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

export default function BreakEvenChartDiagram({
  fixedCosts,
  variableCostPerUnit,
  pricePerUnit,
  breakEvenUnits,
  maxUnits,
  labelRevenue,
  labelCost,
  labelBreakEven,
  caption,
}: BreakEvenChartDiagramProps) {
  const maxRevenue = pricePerUnit * maxUnits;
  const maxCost = fixedCosts + variableCostPerUnit * maxUnits;
  const maxY = Math.max(maxRevenue, maxCost, 1);

  const xAt = (units: number) => MARGIN.left + (units / maxUnits) * PLOT_W;
  const yAt = (value: number) => MARGIN.top + PLOT_H - (value / maxY) * PLOT_H;

  const revenuePath = `M ${xAt(0)} ${yAt(0)} L ${xAt(maxUnits)} ${yAt(maxRevenue)}`;
  const costPath = `M ${xAt(0)} ${yAt(fixedCosts)} L ${xAt(maxUnits)} ${yAt(maxCost)}`;
  const bePoint = { x: xAt(breakEvenUnits), y: yAt(breakEvenUnits * pricePerUnit) };

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <line x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + PLOT_H} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <line x1={MARGIN.left} y1={MARGIN.top + PLOT_H} x2={WIDTH - MARGIN.right} y2={MARGIN.top + PLOT_H} stroke="currentColor" strokeWidth={1} opacity={0.3} />

          <path d={costPath} fill="none" strokeWidth={2.5} className="stroke-amber-500 dark:stroke-amber-400" />
          <path d={revenuePath} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />

          <line x1={bePoint.x} y1={bePoint.y} x2={bePoint.x} y2={MARGIN.top + PLOT_H} strokeDasharray="3 3" strokeWidth={1} className="stroke-emerald-500 dark:stroke-emerald-400" />
          <circle cx={bePoint.x} cy={bePoint.y} r={4} className="fill-emerald-500 dark:fill-emerald-400" />
          <text x={bePoint.x} y={bePoint.y - 10} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-emerald-600 dark:fill-emerald-400">
            {labelBreakEven}
          </text>

          <text x={WIDTH - MARGIN.right} y={yAt(maxRevenue) - 6} textAnchor="end" fontSize={10} fontWeight={600} className="fill-blue-600 dark:fill-blue-400">
            {labelRevenue}
          </text>
          <text x={WIDTH - MARGIN.right} y={yAt(maxCost) + 14} textAnchor="end" fontSize={10} fontWeight={600} className="fill-amber-600 dark:fill-amber-400">
            {labelCost}
          </text>

          <text x={MARGIN.left} y={HEIGHT - 10} fontSize={9} opacity={0.6} fill="currentColor">
            0
          </text>
          <text x={WIDTH - MARGIN.right} y={HEIGHT - 10} textAnchor="end" fontSize={9} opacity={0.6} fill="currentColor">
            {maxUnits}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
