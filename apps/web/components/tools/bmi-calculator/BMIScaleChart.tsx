type ZoneKey = "underweight" | "normal" | "overweight" | "obese";

type BMIScaleChartProps = {
  bmi?: number;
  labels: Record<ZoneKey, string> & { yourBmi: string };
};

const DOMAIN_MIN = 15;
const DOMAIN_MAX = 40;
const WIDTH = 400;
const BAR_Y = 12;
const BAR_HEIGHT = 22;

const ZONES: { key: ZoneKey; from: number; to: number; color: string }[] = [
  { key: "underweight", from: 15, to: 18.5, color: "#3b82f6" },
  { key: "normal", from: 18.5, to: 25, color: "#22c55e" },
  { key: "overweight", from: 25, to: 30, color: "#f59e0b" },
  { key: "obese", from: 30, to: 40, color: "#ef4444" },
];

const TICKS = [15, 18.5, 25, 30, 40];

function scaleX(value: number) {
  const clamped = Math.min(Math.max(value, DOMAIN_MIN), DOMAIN_MAX);
  return ((clamped - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * WIDTH;
}

function zoneForBmi(bmi: number): ZoneKey {
  const zone = ZONES.find((z) => bmi < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function BMIScaleChart({ bmi, labels }: BMIScaleChartProps) {
  const markerX = bmi !== undefined ? scaleX(bmi) : null;
  const activeZone = bmi !== undefined ? zoneForBmi(bmi) : null;

  return (
    // Kept LTR regardless of page direction so the ascending numeric scale reads intuitively in RTL locales too.
    <div dir="ltr" className="w-full">
      <svg viewBox={`-16 0 ${WIDTH + 32} 62`} role="img" className="w-full">
        {bmi !== undefined && (
          <title>
            {labels.yourBmi}: {bmi}
          </title>
        )}

        {ZONES.map((zone) => {
          const x = scaleX(zone.from);
          const w = scaleX(zone.to) - x;
          const isActive = activeZone === zone.key;
          return (
            <rect
              key={zone.key}
              x={x}
              y={BAR_Y}
              width={w}
              height={BAR_HEIGHT}
              fill={zone.color}
              opacity={activeZone === null || isActive ? 1 : 0.35}
            />
          );
        })}

        {TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={scaleX(tick)}
              y1={BAR_Y + BAR_HEIGHT}
              x2={scaleX(tick)}
              y2={BAR_Y + BAR_HEIGHT + 5}
              stroke="currentColor"
              strokeOpacity={0.3}
              className="text-zinc-400 dark:text-zinc-600"
            />
            <text
              x={scaleX(tick)}
              y={BAR_Y + BAR_HEIGHT + 18}
              fontSize={10}
              textAnchor="middle"
              fill="currentColor"
              className="text-zinc-500 dark:text-zinc-400"
            >
              {tick}
            </text>
          </g>
        ))}

        {markerX !== null && (
          <g transform={`translate(${markerX}, 0)`}>
            <polygon points="-6,0 6,0 0,10" className="fill-zinc-900 dark:fill-zinc-50" />
            <line
              x1={0}
              y1={10}
              x2={0}
              y2={BAR_Y + BAR_HEIGHT}
              strokeWidth={2}
              className="stroke-zinc-900 dark:stroke-zinc-50"
            />
          </g>
        )}
      </svg>

      <div className="mt-1 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          {labels.underweight}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {labels.normal}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {labels.overweight}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {labels.obese}
        </span>
      </div>
    </div>
  );
}
