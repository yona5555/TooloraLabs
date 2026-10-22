"use client";
import { useTranslations } from "next-intl";
import { computeDualAge, gregorianBirthdayInYear } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import HistoryTape, { type TapeEntry } from "@/components/tool-ui/HistoryTape";
import type { Derived, Formatters } from "./ageModel";

export type AgeHistoryEntry = TapeEntry & { query: string };

type Props = {
  d: Derived;
  f: Formatters;
  entries: AgeHistoryEntry[];
  onSelect: (entry: AgeHistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
};

/** Recent calculations (per visitor) plus a live list of the next birthdays in both calendars. */
export default function AgeHistoryCard({ d, f, entries, onSelect, onDelete, onClear }: Props) {
  const t = useTranslations("tools.age-calculator.dual");
  const { report: r } = d;
  const g = r.gregorian;
  const firstAge = g.isBirthdayToday ? g.years : g.years + 1;
  const upcoming = Array.from({ length: 10 }, (_, i) => {
    const age = firstAge + i;
    const date = gregorianBirthdayInYear(r.birth, r.birth.year + age, r.leapRule);
    const at = computeDualAge(r.birth, date, r.leapRule);
    return { age, date, weekday: (r.birthWeekday + at.totalDays) % 7, hijriYears: at.hijri?.years ?? 0 };
  });

  return (
    <SectionCard title={t("history.title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col">
      <HistoryTape
        entries={entries}
        onSelect={(e) => onSelect(e as AgeHistoryEntry)}
        onDelete={onDelete}
        onClear={onClear}
        formatTotal={(total) => t("history.totalDays", { n: f.int(total) })}
        emptyText={t("history.empty")}
        maxHeightClass="max-h-[220px]"
      />
      <div className="mt-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <p className="mb-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">{t("history.upcoming")}</p>
        <div className="overflow-auto rounded-xl border border-zinc-200 lg:min-h-[120px] lg:flex-1 dark:border-zinc-700">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-2 py-1 text-start font-semibold">{t("history.age")}</th>
                <th className="px-2 py-1 text-start font-semibold">{t("history.date")}</th>
                <th className="px-2 py-1 text-end font-semibold">{t("cal.hijri")}</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((u) => (
                <tr key={u.age} className="border-t border-zinc-100 dark:border-zinc-700/60">
                  <td className="px-2 py-1 font-bold text-blue-700 dark:text-blue-300">{f.int(u.age)}</td>
                  <td className="px-2 py-1 text-zinc-700 dark:text-zinc-200">
                    {f.greg(u.date)} <span className="text-zinc-400">· {f.weekdayShort(u.weekday)}</span>
                  </td>
                  <td className="px-2 py-1 text-end font-semibold text-emerald-700 dark:text-emerald-300">{f.int(u.hijriYears)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
