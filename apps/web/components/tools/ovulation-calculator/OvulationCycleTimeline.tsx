"use client";
import { useTranslations } from "next-intl";
import type { FertileWindow } from "./types";

const WIDTH = 320;
const HEIGHT = 36;

function daysBetween(startISO: string, endISO: string): number {
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  return Math.round((new Date(ey, em - 1, ed).getTime() - new Date(sy, sm - 1, sd).getTime()) / 86400000);
}

/** One highlighted band per cycle showing the fertile window and ovulation day, scaled to the full projected span. */
export default function OvulationCycleTimeline({ cycles }: { cycles: FertileWindow[] }) {
  const t = useTranslations("tools.ovulation-calculator.diagram");
  if (cycles.length === 0) return null;

  const totalSpan = daysBetween(cycles[0].fertileWindowStartISO, cycles[cycles.length - 1].nextPeriodDateISO) || 1;
  const scaleX = (days: number) => (days / totalSpan) * WIDTH;
  const rowHeight = HEIGHT;

  return (
    <div dir="ltr" className="w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${rowHeight * cycles.length}`}
        role="img"
        aria-label={t("ariaLabel")}
        className="mx-auto block w-full max-w-[360px]"
      >
        {cycles.map((cycle, i) => {
          const originOffset = daysBetween(cycles[0].fertileWindowStartISO, cycle.fertileWindowStartISO);
          const fertileWidth = scaleX(daysBetween(cycle.fertileWindowStartISO, cycle.fertileWindowEndISO)) || 4;
          const ovulationOffset = scaleX(daysBetween(cycle.fertileWindowStartISO, cycle.ovulationDateISO));
          const y = i * rowHeight;
          return (
            <g key={cycle.cycleNumber}>
              <line x1={0} y1={y + rowHeight / 2} x2={WIDTH} y2={y + rowHeight / 2} strokeWidth={1} className="stroke-zinc-200 dark:stroke-zinc-800" />
              <rect
                x={scaleX(originOffset)}
                y={y + rowHeight / 2 - 6}
                width={fertileWidth}
                height={12}
                rx={4}
                className="fill-pink-400/60 dark:fill-pink-500/50"
              />
              <circle cx={scaleX(originOffset) + ovulationOffset} cy={y + rowHeight / 2} r={5} className="fill-pink-600 dark:fill-pink-400" />
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-full bg-pink-400/60 dark:bg-pink-500/50" />
          {t("fertileWindow")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-pink-600 dark:bg-pink-400" />
          {t("ovulationDay")}
        </span>
      </div>
    </div>
  );
}
