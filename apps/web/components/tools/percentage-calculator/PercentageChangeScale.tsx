"use client";
import { useTranslations } from "next-intl";

const WIDTH = 320;
const HEIGHT = 60;
const TRACK_Y = 28;

/**
 * A signed scale (-domain to +domain) marking where the computed percentage change/difference
 * itself falls — distinct from PercentageComparisonChart (which plots the two absolute input
 * values as bars, not the signed % between them) and PercentageRateGauge (a fixed illustrative
 * 0-50% reference widget in the encyclopedia section, not this calculation's live output). Only
 * meaningful for the two modes whose result is itself a signed percentage change.
 */
export default function PercentageChangeScale({ value }: { value: number }) {
  const t = useTranslations("tools.percentage-calculator.changeScale");
  if (!Number.isFinite(value)) return null;

  const domain = Math.max(50, Math.ceil(Math.abs(value) / 25) * 25 + 25);
  const clamped = Math.min(Math.max(value, -domain), domain);
  const fraction = (clamped + domain) / (domain * 2);
  const markerX = fraction * WIDTH;
  const zeroX = WIDTH / 2;
  const isIncrease = value > 0;
  const isFlat = value === 0;
  const barColor = isFlat ? "#a1a1aa" : isIncrease ? "#22c55e" : "#ef4444";

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("ariaLabel", { value: value.toFixed(1) })} className="mx-auto block w-full max-w-sm">
        <line x1={0} y1={TRACK_Y} x2={WIDTH} y2={TRACK_Y} className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth={3} strokeLinecap="round" />
        <line x1={zeroX} y1={TRACK_Y - 8} x2={zeroX} y2={TRACK_Y + 8} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth={1.5} />
        {!isFlat && (
          <line
            x1={zeroX}
            y1={TRACK_Y}
            x2={markerX}
            y2={TRACK_Y}
            stroke={barColor}
            strokeWidth={4}
            strokeLinecap="round"
          />
        )}
        <circle cx={markerX} cy={TRACK_Y} r={7} fill={barColor} stroke="white" strokeWidth={1.5} />
        <text x={markerX} y={TRACK_Y - 16} fontSize={13} fontWeight={700} textAnchor="middle" fill={barColor}>
          {value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`}
        </text>
        <text x={0} y={HEIGHT - 4} fontSize={10} textAnchor="start" fill="currentColor" opacity={0.5}>
          {`-${domain}%`}
        </text>
        <text x={zeroX} y={HEIGHT - 4} fontSize={10} textAnchor="middle" fill="currentColor" opacity={0.5}>
          0%
        </text>
        <text x={WIDTH} y={HEIGHT - 4} fontSize={10} textAnchor="end" fill="currentColor" opacity={0.5}>
          {`+${domain}%`}
        </text>
      </svg>
      <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {isFlat ? t("noChange") : isIncrease ? t("increaseCaption") : t("decreaseCaption")}
      </p>
    </div>
  );
}
