import type { Gender } from "@tooloralabs/tools";

type ZoneKey = "essential" | "athletes" | "fitness" | "average" | "obese";

type BMIBodyFatGaugeProps = {
  bodyFatPercent?: number;
  gender: Gender;
  labels: Record<ZoneKey, string> & { yourBodyFat: string };
};

const WIDTH = 400;
const BAR_Y = 12;
const BAR_HEIGHT = 22;

/**
 * American Council on Exercise (ACE) body-fat-percentage categories —
 * differ by sex because essential fat needed for hormonal/reproductive
 * function is higher in women (~10-13%) than men (~2-5%).
 */
const ZONES_BY_GENDER: Record<Gender, { key: ZoneKey; from: number; to: number; color: string }[]> = {
  male: [
    { key: "essential", from: 0, to: 6, color: "#3b82f6" },
    { key: "athletes", from: 6, to: 14, color: "#22c55e" },
    { key: "fitness", from: 14, to: 18, color: "#84cc16" },
    { key: "average", from: 18, to: 25, color: "#f59e0b" },
    { key: "obese", from: 25, to: 40, color: "#ef4444" },
  ],
  female: [
    { key: "essential", from: 0, to: 14, color: "#3b82f6" },
    { key: "athletes", from: 14, to: 21, color: "#22c55e" },
    { key: "fitness", from: 21, to: 25, color: "#84cc16" },
    { key: "average", from: 25, to: 32, color: "#f59e0b" },
    { key: "obese", from: 32, to: 45, color: "#ef4444" },
  ],
};

const DOMAIN_MAX_BY_GENDER: Record<Gender, number> = { male: 40, female: 45 };

function scaleX(value: number, domainMax: number) {
  const clamped = Math.min(Math.max(value, 0), domainMax);
  return (clamped / domainMax) * WIDTH;
}

export default function BMIBodyFatGauge({ bodyFatPercent, gender, labels }: BMIBodyFatGaugeProps) {
  const zones = ZONES_BY_GENDER[gender];
  const domainMax = DOMAIN_MAX_BY_GENDER[gender];
  const markerX = bodyFatPercent !== undefined ? scaleX(bodyFatPercent, domainMax) : null;
  const activeZone =
    bodyFatPercent !== undefined ? (zones.find((z) => bodyFatPercent < z.to) ?? zones[zones.length - 1]).key : null;
  const ticks = [0, ...zones.map((z) => z.to)];

  return (
    <div dir="ltr" className="w-full">
      <svg
        viewBox={`-16 0 ${WIDTH + 32} 62`}
        role="img"
        aria-label={bodyFatPercent !== undefined ? `${labels.yourBodyFat}: ${bodyFatPercent}%` : undefined}
        className="w-full"
      >
        {zones.map((zone) => {
          const x = scaleX(zone.from, domainMax);
          const w = scaleX(zone.to, domainMax) - x;
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

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={scaleX(tick, domainMax)}
              y1={BAR_Y + BAR_HEIGHT}
              x2={scaleX(tick, domainMax)}
              y2={BAR_Y + BAR_HEIGHT + 5}
              stroke="currentColor"
              strokeOpacity={0.3}
              className="text-zinc-400 dark:text-zinc-600"
            />
            <text
              x={scaleX(tick, domainMax)}
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

      <div className="mt-1 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          {labels.essential}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {labels.athletes}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-lime-500" />
          {labels.fitness}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {labels.average}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {labels.obese}
        </span>
      </div>
    </div>
  );
}
