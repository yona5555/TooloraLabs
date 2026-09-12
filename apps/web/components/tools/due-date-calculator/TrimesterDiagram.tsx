"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Fixed reference: the three trimesters mapped across the full 40-week span
 * — distinct from PregnancyProgressBar (the live bar for the user's own
 * calculated current week) and DueDateWeekGauge (the interactive "try it"
 * widget). This is a static week-range legend.
 */
const TRIMESTERS: { key: string; fromWeek: number; toWeek: number; colorClass: string }[] = [
  { key: "first", fromWeek: 1, toWeek: 13, colorClass: "bg-pink-300 dark:bg-pink-500/60" },
  { key: "second", fromWeek: 14, toWeek: 27, colorClass: "bg-pink-500 dark:bg-pink-500" },
  { key: "third", fromWeek: 28, toWeek: 40, colorClass: "bg-pink-700 dark:bg-pink-400" },
];

export default function TrimesterDiagram() {
  const d = useTranslations("tools.due-date-calculator.trimesterDiagram");
  const tTrimesters = useTranslations("tools.due-date-calculator.trimesterDiagram.trimesters");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4">
        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {TRIMESTERS.map((tr) => (
            <div key={tr.key} className={tr.colorClass} style={{ width: `${((tr.toWeek - tr.fromWeek + 1) / 40) * 100}%` }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>{d("week1")}</span>
          <span>{d("week40")}</span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TRIMESTERS.map((tr) => (
            <span key={tr.key} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tr.colorClass}`} />
              {tTrimesters(tr.key)} ({d("weeksRange", { from: tr.fromWeek, to: tr.toWeek })})
            </span>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
