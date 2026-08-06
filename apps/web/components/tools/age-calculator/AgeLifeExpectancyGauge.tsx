import type { LifeStage } from "@tooloralabs/tools";

type ZoneKey = LifeStage;

type AgeLifeExpectancyGaugeProps = {
  decimalAge: number;
  lifeExpectancyYears: number;
  activeStage: ZoneKey;
  labels: Record<ZoneKey, string> & { yourAge: string };
};

const WIDTH = 400;
const BAR_Y = 12;
const BAR_HEIGHT = 22;

const STAGE_ORDER: ZoneKey[] = ["childhood", "adolescence", "youth", "middleAge", "oldAge"];

const STAGE_BOUNDS: Record<ZoneKey, { from: number; to: number }> = {
  childhood: { from: 0, to: 10 },
  adolescence: { from: 10, to: 20 },
  youth: { from: 20, to: 40 },
  middleAge: { from: 40, to: 60 },
  oldAge: { from: 60, to: Infinity },
};

const STAGE_COLOR: Record<ZoneKey, string> = {
  childhood: "#93c5fd",
  adolescence: "#60a5fa",
  youth: "#3b82f6",
  middleAge: "#2563eb",
  oldAge: "#1e40af",
};

export default function AgeLifeExpectancyGauge({
  decimalAge,
  lifeExpectancyYears,
  activeStage,
  labels,
}: AgeLifeExpectancyGaugeProps) {
  const domainMax = Math.max(lifeExpectancyYears, decimalAge, 60);

  function scaleX(value: number) {
    const clamped = Math.min(Math.max(value, 0), domainMax);
    return (clamped / domainMax) * WIDTH;
  }

  const markerX = scaleX(decimalAge);
  const ticks = [0, 10, 20, 40, 60, Math.round(lifeExpectancyYears)].filter(
    (tick, index, arr) => arr.indexOf(tick) === index && tick <= domainMax
  );

  return (
    // Kept LTR regardless of page direction so the ascending numeric scale reads intuitively in RTL locales too.
    <div dir="ltr" className="w-full">
      <svg
        viewBox={`-16 0 ${WIDTH + 32} 62`}
        role="img"
        aria-label={`${labels.yourAge}: ${decimalAge.toFixed(1)}`}
        className="w-full"
      >
        {STAGE_ORDER.map((stage) => {
          const bounds = STAGE_BOUNDS[stage];
          const x = scaleX(bounds.from);
          const w = scaleX(Math.min(bounds.to, domainMax)) - x;
          if (w <= 0) return null;
          const isActive = activeStage === stage;
          return (
            <rect
              key={stage}
              x={x}
              y={BAR_Y}
              width={w}
              height={BAR_HEIGHT}
              fill={STAGE_COLOR[stage]}
              opacity={isActive ? 1 : 0.35}
            />
          );
        })}

        {ticks.map((tick) => (
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
      </svg>

      <div className="mt-1 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {STAGE_ORDER.map((stage) => (
          <span key={stage} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STAGE_COLOR[stage] }} />
            {labels[stage]}
          </span>
        ))}
      </div>
    </div>
  );
}
