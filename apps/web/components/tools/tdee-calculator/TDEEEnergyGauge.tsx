type ZoneKey = "aggressiveDeficit" | "moderateDeficit" | "maintenance" | "moderateSurplus" | "aggressiveSurplus";

type TDEEEnergyGaugeProps = {
  /** The goal's daily adjustment as a percent of TDEE, signed: negative for a deficit, positive for a surplus. */
  adjustmentPercent: number;
  labels: Record<ZoneKey, string> & { yourGoal: string };
};

const DOMAIN_MIN = -50;
const DOMAIN_MAX = 50;
const WIDTH = 400;
const BAR_Y = 12;
const BAR_HEIGHT = 22;

const ZONES: { key: ZoneKey; from: number; to: number; color: string }[] = [
  { key: "aggressiveDeficit", from: -50, to: -35, color: "#ef4444" },
  { key: "moderateDeficit", from: -35, to: -10, color: "#f59e0b" },
  { key: "maintenance", from: -10, to: 10, color: "#22c55e" },
  { key: "moderateSurplus", from: 10, to: 35, color: "#f59e0b" },
  { key: "aggressiveSurplus", from: 35, to: 50, color: "#ef4444" },
];

const TICKS = [-50, -35, -10, 10, 35, 50];

function scaleX(value: number) {
  const clamped = Math.min(Math.max(value, DOMAIN_MIN), DOMAIN_MAX);
  return ((clamped - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * WIDTH;
}

function zoneFor(value: number): ZoneKey {
  const zone = ZONES.find((z) => value < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function TDEEEnergyGauge({ adjustmentPercent, labels }: TDEEEnergyGaugeProps) {
  const markerX = scaleX(adjustmentPercent);
  const activeZone = zoneFor(adjustmentPercent);

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`-16 0 ${WIDTH + 32} 62`} role="img" aria-label={`${labels.yourGoal}: ${adjustmentPercent.toFixed(0)}%`} className="w-full">
        {ZONES.map((zone) => {
          const x = scaleX(zone.from);
          const w = scaleX(zone.to) - x;
          const isActive = activeZone === zone.key;
          return <rect key={zone.key} x={x} y={BAR_Y} width={w} height={BAR_HEIGHT} fill={zone.color} opacity={isActive ? 1 : 0.35} />;
        })}

        {TICKS.map((tick) => (
          <g key={tick}>
            <line x1={scaleX(tick)} y1={BAR_Y + BAR_HEIGHT} x2={scaleX(tick)} y2={BAR_Y + BAR_HEIGHT + 5} stroke="currentColor" strokeOpacity={0.3} className="text-zinc-400 dark:text-zinc-600" />
            <text x={scaleX(tick)} y={BAR_Y + BAR_HEIGHT + 18} fontSize={10} textAnchor="middle" fill="currentColor" className="text-zinc-500 dark:text-zinc-400">
              {tick > 0 ? `+${tick}%` : `${tick}%`}
            </text>
          </g>
        ))}

        <g transform={`translate(${markerX}, 0)`}>
          <polygon points="-6,0 6,0 0,10" className="fill-zinc-900 dark:fill-zinc-50" />
          <line x1={0} y1={10} x2={0} y2={BAR_Y + BAR_HEIGHT} strokeWidth={2} className="stroke-zinc-900 dark:stroke-zinc-50" />
        </g>
      </svg>

      <div className="mt-1 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {labels.aggressiveDeficit}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {labels.moderateDeficit}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {labels.maintenance}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {labels.moderateSurplus}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {labels.aggressiveSurplus}
        </span>
      </div>
    </div>
  );
}
