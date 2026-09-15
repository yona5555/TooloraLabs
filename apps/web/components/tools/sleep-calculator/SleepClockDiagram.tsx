"use client";
import { useTranslations } from "next-intl";
import type { SleepOption } from "./types";

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 92;
const DOT_RADIUS = 7;

function formatClockShort(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * A 24-hour clock face plotting each recommended option at its actual clock position — distinct
 * from SleepCycleDiagram (which shows cycle COUNT as abstract blocks, not time-of-day) and the
 * duration gauge (which shows a span, not a moment). Answers "what time on the clock" rather than
 * "how many cycles" or "how many hours."
 */
export default function SleepClockDiagram({ options }: { options: SleepOption[] }) {
  const t = useTranslations("tools.sleep-calculator.clockDiagram");
  if (options.length === 0) return null;

  const bestIndex = 0;

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("ariaLabel")} className="mx-auto block h-auto w-full max-w-[220px]">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth={1.5} />
        {Array.from({ length: 24 }).map((_, hour) => {
          const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
          const isMajor = hour % 6 === 0;
          const inner = isMajor ? RADIUS - 10 : RADIUS - 5;
          const x1 = CENTER + inner * Math.cos(angle);
          const y1 = CENTER + inner * Math.sin(angle);
          const x2 = CENTER + RADIUS * Math.cos(angle);
          const y2 = CENTER + RADIUS * Math.sin(angle);
          return <line key={hour} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth={isMajor ? 1.5 : 0.75} />;
        })}
        {[0, 6, 12, 18].map((hour) => {
          const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
          const x = CENTER + (RADIUS - 22) * Math.cos(angle);
          const y = CENTER + (RADIUS - 22) * Math.sin(angle);
          return (
            <text key={hour} x={x} y={y + 4} fontSize={10} textAnchor="middle" fill="currentColor" opacity={0.55}>
              {hour === 0 ? "24" : hour}
            </text>
          );
        })}
        {options.map((option, index) => {
          const angle = ((option.clockMinutes / 1440) * 2 * Math.PI) - Math.PI / 2;
          const x = CENTER + RADIUS * Math.cos(angle);
          const y = CENTER + RADIUS * Math.sin(angle);
          const isBest = index === bestIndex;
          return (
            <circle
              key={option.cycles}
              cx={x}
              cy={y}
              r={isBest ? DOT_RADIUS + 2 : DOT_RADIUS}
              fill={isBest ? "#2563eb" : "#93c5fd"}
              className={isBest ? "" : "dark:fill-blue-800"}
              stroke="white"
              strokeWidth={1.5}
            />
          );
        })}
      </svg>
      <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {t("caption", { time: formatClockShort(options[bestIndex].clockMinutes) })}
      </p>
    </div>
  );
}
