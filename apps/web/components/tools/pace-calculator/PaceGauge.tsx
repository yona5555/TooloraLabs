"use client";
import { useTranslations } from "next-intl";
import { formatClock } from "@tooloralabs/tools";

type ZoneKey = "elite" | "fast" | "moderate" | "easy" | "recovery";

type PaceGaugeProps = {
  /** Pace in seconds per km. Omit (or pass undefined) to render the scale with no marker. */
  paceSecondsPerKm?: number;
};

const DOMAIN_MIN = 180; // 3:00/km
const DOMAIN_MAX = 720; // 12:00/km
const WIDTH = 400;
const BAR_Y = 12;
const BAR_HEIGHT = 22;

const ZONES: { key: ZoneKey; from: number; to: number; color: string }[] = [
  { key: "elite", from: 180, to: 240, color: "#ef4444" },
  { key: "fast", from: 240, to: 300, color: "#f59e0b" },
  { key: "moderate", from: 300, to: 390, color: "#22c55e" },
  { key: "easy", from: 390, to: 480, color: "#3b82f6" },
  { key: "recovery", from: 480, to: 720, color: "#a1a1aa" },
];

const TICKS = [180, 240, 300, 390, 480, 720];

function scaleX(value: number) {
  const clamped = Math.min(Math.max(value, DOMAIN_MIN), DOMAIN_MAX);
  return ((clamped - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * WIDTH;
}

function zoneForPace(paceSeconds: number): ZoneKey {
  const zone = ZONES.find((z) => paceSeconds < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function PaceGauge({ paceSecondsPerKm }: PaceGaugeProps) {
  const t = useTranslations("tools.pace-calculator.gauge");
  const hasValue = paceSecondsPerKm !== undefined && Number.isFinite(paceSecondsPerKm) && paceSecondsPerKm > 0;
  const markerX = hasValue ? scaleX(paceSecondsPerKm) : null;
  const activeZone = hasValue ? zoneForPace(paceSecondsPerKm) : null;

  return (
    <div dir="ltr" className="w-full">
      <svg
        viewBox={`-16 0 ${WIDTH + 32} 62`}
        role="img"
        aria-label={hasValue ? `${t("ariaLabel")}: ${formatClock(paceSecondsPerKm)} / km` : t("ariaLabelEmpty")}
        className="w-full"
      >
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
              {formatClock(tick)}
            </text>
          </g>
        ))}

        {markerX !== null && (
          <g transform={`translate(${markerX}, 0)`}>
            <polygon points="-6,0 6,0 0,10" className="fill-zinc-900 dark:fill-zinc-50" />
            <line x1={0} y1={10} x2={0} y2={BAR_Y + BAR_HEIGHT} strokeWidth={2} className="stroke-zinc-900 dark:stroke-zinc-50" />
          </g>
        )}
      </svg>

      <div className="mt-1 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />
          {t("zones.elite")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
          {t("zones.fast")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#22c55e" }} />
          {t("zones.moderate")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
          {t("zones.easy")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#a1a1aa" }} />
          {t("zones.recovery")}
        </span>
      </div>
    </div>
  );
}
