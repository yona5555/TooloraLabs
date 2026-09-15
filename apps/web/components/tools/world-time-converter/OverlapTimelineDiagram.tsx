"use client";
import { useTranslations } from "next-intl";

const BUSINESS_START = 9;
const BUSINESS_END = 17;

type Props = {
  fromLabel: string;
  toLabel: string;
  fromOffsetMinutes: number;
  toOffsetMinutes: number;
  overlapUtcHours: number[];
};

function localHourAt(utcHour: number, offsetMinutes: number): number {
  return (((utcHour + offsetMinutes / 60) % 24) + 24) % 24;
}

function isBusinessHour(localHour: number): boolean {
  return localHour >= BUSINESS_START && localHour < BUSINESS_END;
}

function TimelineRow({ label, offset, hours, overlapSet }: { label: string; offset: number; hours: number[]; overlapSet: Set<number> }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">{label}</span>
      <div className="flex flex-1 gap-0.5">
        {hours.map((utcHour) => {
          const local = localHourAt(utcHour, offset);
          const business = isBusinessHour(local);
          const overlapping = overlapSet.has(utcHour);
          return (
            <div
              key={utcHour}
              className={`h-4 flex-1 rounded-sm ${
                business ? "bg-blue-500 dark:bg-blue-400" : "bg-zinc-200 dark:bg-zinc-700"
              } ${overlapping ? "ring-2 ring-emerald-500 dark:ring-emerald-400" : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Live 24-UTC-hour timeline for both selected cities, each cell shaded when
 * that hour falls in that city's own 9am-5pm local business hours, with the
 * genuinely-overlapping hours (the exact same set MeetingPlanner already
 * lists as chips below) ringed — visualizes the same computation instead of
 * only listing it as text.
 */
export default function OverlapTimelineDiagram({ fromLabel, toLabel, fromOffsetMinutes, toOffsetMinutes, overlapUtcHours }: Props) {
  const t = useTranslations("tools.world-time-converter.overlapTimeline");
  const overlapSet = new Set(overlapUtcHours);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div dir="ltr" className="mt-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div className="flex flex-col gap-2">
        <TimelineRow label={fromLabel} offset={fromOffsetMinutes} hours={hours} overlapSet={overlapSet} />
        <TimelineRow label={toLabel} offset={toOffsetMinutes} hours={hours} overlapSet={overlapSet} />
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-500 dark:bg-blue-400" />
          {t("businessHoursLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-zinc-200 ring-2 ring-emerald-500 dark:bg-zinc-700 dark:ring-emerald-400" />
          {t("overlapLabel")}
        </span>
      </div>
    </div>
  );
}
