"use client";
import { useTranslations } from "next-intl";
import { addBusinessDays, addCivilDays } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import HistoryTape, { type TapeEntry } from "@/components/tool-ui/HistoryTape";
import type { Derived, Formatters } from "./dateModel";

export type DateHistoryEntry = TapeEntry & { query: string };

type Props = {
  d: Derived;
  f: Formatters;
  entries: DateHistoryEntry[];
  onSelect: (entry: DateHistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
};

const MILESTONES = [7, 14, 30, 60, 90, 180];

/** Recent calculations (per visitor) plus a live deadline table from the start date in both calendars. */
export default function DateHistoryCard({ d, f, entries, onSelect, onDelete, onClear }: Props) {
  const t = useTranslations("tools.date-calculator.pro");
  return (
    <SectionCard title={t("history.title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col">
      <HistoryTape
        entries={entries}
        onSelect={(e) => onSelect(e as DateHistoryEntry)}
        onDelete={onDelete}
        onClear={onClear}
        formatTotal={(total) => t("history.totalDays", { n: f.int(total) })}
        emptyText={t("history.empty")}
        maxHeightClass="max-h-[200px]"
      />
      <div className="mt-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <p className="mb-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">{t("history.deadlines", { date: f.greg(d.start) })}</p>
        <div className="overflow-auto rounded-xl border border-zinc-200 lg:min-h-[120px] lg:flex-1 dark:border-zinc-700">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-2 py-1 text-start font-semibold">{t("history.plus")}</th>
                <th className="px-2 py-1 text-start font-semibold">{t("history.calendarDays")}</th>
                <th className="px-2 py-1 text-end font-semibold">{t("history.businessDays")}</th>
              </tr>
            </thead>
            <tbody>
              {MILESTONES.map((n) => {
                const cal = addCivilDays(d.start, n);
                const biz = addBusinessDays(d.start, n, d.weekend, d.holidays);
                return (
                  <tr key={n} className="border-t border-zinc-100 dark:border-zinc-700/60">
                    <td className="px-2 py-1 font-bold text-blue-700 dark:text-blue-300">+{f.int(n)}</td>
                    <td className="px-2 py-1 text-zinc-700 dark:text-zinc-200">
                      {f.greg(cal)}
                      <span className="block text-[10px] text-emerald-700 dark:text-emerald-300">{f.hijri(cal)}</span>
                    </td>
                    <td className="px-2 py-1 text-end text-zinc-700 dark:text-zinc-200">
                      {f.greg(biz)}
                      <span className="block text-[10px] text-emerald-700 dark:text-emerald-300">{f.hijri(biz)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
