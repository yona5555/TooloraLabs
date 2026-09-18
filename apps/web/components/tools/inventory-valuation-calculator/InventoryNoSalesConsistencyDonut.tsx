const SIZE = 150;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type InventoryNoSalesConsistencyDonutProps = {
  centerLabel: string;
  caption: string;
};

export default function InventoryNoSalesConsistencyDonut({ centerLabel, caption }: InventoryNoSalesConsistencyDonutProps) {
  const center = SIZE / 2;

  return (
    <figure className="my-2 flex flex-col items-center">
      <div dir="ltr">
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
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
