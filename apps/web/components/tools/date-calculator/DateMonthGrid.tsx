"use client";
import { civilToUtcMs, civilWeekday, daysInMonth, formatIsoDate, gregorianToHijri, type CivilDate, type WeekendPreset } from "@tooloralabs/tools";
import { DATE_COLORS, isWeekendDay, type Formatters } from "./dateModel";

type Props = {
  /** Month to draw (the end date or the resulting date). */
  focus: CivilDate;
  /** Counted range [from, toExclusive). */
  from: CivilDate;
  toExclusive: CivilDate;
  weekend: WeekendPreset;
  holidays: readonly string[];
  rtl: boolean;
  f: Formatters;
};

const W = 294;
const CELL = 42;
const HEAD = 22;
const TOP = 20;

/**
 * Live month calendar of the end/result date: every day shows its Gregorian and Umm al-Qura day
 * number, counted days are coloured as workday / weekend / holiday, the focus day is ringed.
 * Columns run right-to-left on RTL pages.
 */
export default function DateMonthGrid({ focus, from, toExclusive, weekend, holidays, rtl, f }: Props) {
  const len = daysInMonth(focus.year, focus.month);
  const first: CivilDate = { year: focus.year, month: focus.month, day: 1 };
  const offset = civilWeekday(first);
  const rows = Math.ceil((offset + len) / 7);
  const H = TOP + HEAD + rows * CELL + 4;
  const lo = civilToUtcMs(from);
  const hi = civilToUtcMs(toExclusive);
  const hol = new Set(holidays);
  const col = (c: number) => (rtl ? 6 - c : c);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={f.monthYear(focus)} style={{ direction: "ltr" }} className="mx-auto block max-h-[340px]">
      <text x={W / 2} y={13} textAnchor="middle" fontSize={12} fontWeight={800} className="fill-zinc-800 dark:fill-zinc-100">
        {f.monthYear(focus)}
      </text>
      {Array.from({ length: 7 }, (_, i) => (
        <text
          key={i}
          x={col(i) * CELL + CELL / 2}
          y={TOP + 14}
          textAnchor="middle"
          fontSize={9.5}
          fontWeight={700}
          fill={isWeekendDay(weekend, i) ? DATE_COLORS.danger : undefined}
          className={isWeekendDay(weekend, i) ? "" : "fill-zinc-500 dark:fill-zinc-400"}
        >
          {f.weekdayShort(i)}
        </text>
      ))}
      {Array.from({ length: len }, (_, i) => {
        const c: CivilDate = { ...first, day: i + 1 };
        const idx = offset + i;
        const x = col(idx % 7) * CELL;
        const y = TOP + HEAD + Math.floor(idx / 7) * CELL;
        const t = civilToUtcMs(c);
        const inRange = t >= lo && t < hi;
        const dow = idx % 7;
        const isWe = isWeekendDay(weekend, dow);
        const isHol = hol.has(formatIsoDate(c));
        const color = isWe ? DATE_COLORS.weekend : isHol ? DATE_COLORS.holiday : DATE_COLORS.business;
        const isFocus = c.day === focus.day;
        const h = gregorianToHijri(c);
        return (
          <g key={i} style={{ transition: "opacity 300ms" }}>
            <rect
              x={x + 2}
              y={y + 2}
              width={CELL - 4}
              height={CELL - 4}
              rx={7}
              fill={color}
              fillOpacity={inRange ? (isWe ? 0.35 : 0.85) : 0.07}
              stroke={isFocus ? DATE_COLORS.danger : "none"}
              strokeWidth={isFocus ? 2.5 : 0}
            />
            <text x={x + CELL / 2} y={y + 21} textAnchor="middle" fontSize={13} fontWeight={800} className={inRange && !isWe ? "fill-white" : "fill-zinc-800 dark:fill-zinc-100"}>
              {f.int(c.day)}
            </text>
            <text x={x + CELL / 2} y={y + 34} textAnchor="middle" fontSize={8.5} fontWeight={600} fill={inRange && !isWe ? "#ecfdf5" : DATE_COLORS.hijri}>
              {f.int(h.day)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
