"use client";
import type { DayCode, ScheduleConflict } from "./types";
import type { DraftClass } from "./types";

type Props = {
  classes: DraftClass[];
  conflicts: ScheduleConflict[];
  dayLabels: Record<DayCode, string>;
  caption: string;
};

const DAY_ORDER: DayCode[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_COL_WIDTH = 60;
const ROW_HEIGHT = 200;
const START_HOUR = 7;
const END_HOUR = 21;

const CLASS_COLORS = [
  "fill-blue-500 dark:fill-blue-500/80",
  "fill-violet-500 dark:fill-violet-500/80",
  "fill-emerald-500 dark:fill-emerald-500/80",
  "fill-sky-500 dark:fill-sky-500/80",
  "fill-fuchsia-500 dark:fill-fuchsia-500/80",
  "fill-teal-500 dark:fill-teal-500/80",
  "fill-orange-500 dark:fill-orange-500/80",
];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((part) => parseInt(part, 10) || 0);
  return h * 60 + m;
}

/**
 * A real weekly timetable built from the actual entered classes — not a
 * decorative calendar graphic. Each block's day and time span is computed
 * directly from the same days/startTime/endTime the user typed, and any
 * class involved in a detected day/time conflict is outlined in the same
 * amber the conflict list already uses, so the visual and the text findings
 * always agree.
 */
export default function ScheduleWeeklyGridDiagram({ classes, conflicts, dayLabels, caption }: Props) {
  const validClasses = classes.filter((c) => c.name && c.days.length > 0 && timeToMinutes(c.endTime) > timeToMinutes(c.startTime));
  if (validClasses.length === 0) return null;

  const totalMinutes = (END_HOUR - START_HOUR) * 60;
  const hourMarks = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  const conflictClassNames = new Set<string>();
  conflicts.forEach((c) => {
    conflictClassNames.add(c.classNameA);
    conflictClassNames.add(c.classNameB);
  });

  const gridWidth = 40 + DAY_ORDER.length * DAY_COL_WIDTH;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${gridWidth} ${ROW_HEIGHT + 24}`} width="100%" className="max-w-full" style={{ minWidth: 420 }}>
          {hourMarks.map((hour) => {
            const y = 24 + ((hour - START_HOUR) / (END_HOUR - START_HOUR)) * ROW_HEIGHT;
            return (
              <g key={hour}>
                <line x1={40} y1={y} x2={gridWidth} y2={y} className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth={1} />
                <text x={0} y={y + 3} className="fill-zinc-400 dark:fill-zinc-500" style={{ fontSize: 8 }}>
                  {String(hour).padStart(2, "0")}:00
                </text>
              </g>
            );
          })}

          {DAY_ORDER.map((day, i) => {
            const x = 40 + i * DAY_COL_WIDTH;
            return (
              <text key={day} x={x + DAY_COL_WIDTH / 2} y={14} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300" style={{ fontSize: 9, fontWeight: 700 }}>
                {dayLabels[day]}
              </text>
            );
          })}

          {validClasses.map((cls, classIdx) => {
            const start = timeToMinutes(cls.startTime);
            const end = timeToMinutes(cls.endTime);
            const clampedStart = Math.max(start, START_HOUR * 60);
            const clampedEnd = Math.min(end, END_HOUR * 60);
            if (clampedEnd <= clampedStart) return null;
            const yTop = 24 + ((clampedStart - START_HOUR * 60) / totalMinutes) * ROW_HEIGHT;
            const blockHeight = ((clampedEnd - clampedStart) / totalMinutes) * ROW_HEIGHT;
            const isConflicted = conflictClassNames.has(cls.name);
            const color = CLASS_COLORS[classIdx % CLASS_COLORS.length];

            return cls.days.map((day) => {
              const dayIndex = DAY_ORDER.indexOf(day as DayCode);
              if (dayIndex === -1) return null;
              const x = 40 + dayIndex * DAY_COL_WIDTH + 2;

              return (
                <rect
                  key={`${cls.name}-${day}`}
                  x={x}
                  y={yTop}
                  width={DAY_COL_WIDTH - 4}
                  height={Math.max(blockHeight, 6)}
                  rx={2}
                  className={color}
                  stroke={isConflicted ? "currentColor" : "none"}
                  strokeWidth={isConflicted ? 2 : 0}
                  style={isConflicted ? { color: "#f59e0b" } : undefined}
                  opacity={0.9}
                />
              );
            });
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
