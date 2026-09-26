const SIZE = 150;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type InventoryNoSalesConsistencyDonutProps = {
  centerLabel: string;
};

/** Single continuous SVG ring — a legitimate quantitative shape, not bordered boxes linked by arrows. */
export default function InventoryNoSalesConsistencyDonut({ centerLabel }: InventoryNoSalesConsistencyDonutProps) {
  const center = SIZE / 2;

  return (
    <div dir="ltr" className="flex justify-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={centerLabel} className="w-36">
        <circle
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeDasharray={`${CIRCUMFERENCE} 0`}
          transform={`rotate(-90 ${center} ${center})`}
          className="stroke-emerald-500 dark:stroke-emerald-400"
        />
        <text x={center} y={center - 4} textAnchor="middle" fontSize={18} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-50">
          $50
        </text>
        <text x={center} y={center + 15} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
          {centerLabel}
        </text>
      </svg>
    </div>
  );
}
