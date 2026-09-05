"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { HeartRateZone } from "./types";

type Props = {
  zones: HeartRateZone[];
  maxHeartRate: number;
  digitStyle: DigitStyle;
};

const WIDTH = 320;
const BAR_HEIGHT = 24;

const ZONE_COLORS: Record<HeartRateZone["key"], string> = {
  veryLight: "#3b82f6",
  light: "#22c55e",
  moderate: "#f59e0b",
  hard: "#f97316",
  maximum: "#ef4444",
};

/**
 * A stacked horizontal bar spanning 0 to the calculated max heart rate, with each of the
 * five training zones drawn to scale as its own colored segment — makes the relative width
 * (not just the numbers) of each zone visible at a glance.
 */
export default function HeartRateZoneChart({ zones, maxHeartRate, digitStyle }: Props) {
  const t = useTranslations("tools.target-heart-rate-calculator");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  if (zones.length === 0 || maxHeartRate <= 0) return null;

  const scaleX = (bpm: number) => (bpm / maxHeartRate) * WIDTH;

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${BAR_HEIGHT}`} role="img" aria-label={`${t("diagram.ariaLabel")}: max=${fmt(maxHeartRate)} bpm`} className="w-full">
        {zones.map((zone) => {
          const x = scaleX(zone.lowBpm);
          const w = scaleX(zone.highBpm) - x;
          return <rect key={zone.key} x={x} y={0} width={w} height={BAR_HEIGHT} rx={3} fill={ZONE_COLORS[zone.key]} />;
        })}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-3">
        {zones.map((zone) => (
          <span key={zone.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: ZONE_COLORS[zone.key] }} />
            {t(`zones.${zone.key}`)}
          </span>
        ))}
      </div>
    </div>
  );
}
