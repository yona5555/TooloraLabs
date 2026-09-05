"use client";
import { useTranslations } from "next-intl";

type Props = {
  hours: number;
  minutes: number;
};

/** A simple analog clock face pointing to the result's hours and minutes — a familiar, immediate visual for a duration result. */
export default function TimeClockDiagram({ hours, minutes }: Props) {
  const t = useTranslations("tools.time-calculator.diagram");
  const cx = 60;
  const cy = 60;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30 - 90;
  const minuteAngle = (minutes / 60) * 360 - 90;

  const hourEnd = { x: cx + 28 * Math.cos((hourAngle * Math.PI) / 180), y: cy + 28 * Math.sin((hourAngle * Math.PI) / 180) };
  const minuteEnd = { x: cx + 42 * Math.cos((minuteAngle * Math.PI) / 180), y: cy + 42 * Math.sin((minuteAngle * Math.PI) / 180) };

  return (
    <div dir="ltr" className="flex justify-center">
      <svg viewBox="0 0 120 120" role="img" aria-label={`${t("ariaLabel")}: ${hours}h ${minutes}m`} className="h-28 w-28">
        <circle cx={cx} cy={cy} r={50} className="fill-zinc-100 stroke-zinc-300 dark:fill-zinc-800 dark:stroke-zinc-600" strokeWidth={2} />
        <line x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y} strokeWidth={4} strokeLinecap="round" className="stroke-blue-700 dark:stroke-blue-300" />
        <line x1={cx} y1={cy} x2={minuteEnd.x} y2={minuteEnd.y} strokeWidth={2.5} strokeLinecap="round" className="stroke-blue-500 dark:stroke-blue-400" />
        <circle cx={cx} cy={cy} r={3} className="fill-blue-700 dark:fill-blue-300" />
      </svg>
    </div>
  );
}
