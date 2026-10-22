"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useDateFmt, useDueLive } from "./DueDateLiveContext";
import { TRIMESTERS, ZONES, wd } from "./dueDate";

/**
 * Input-column filler (§27): the pregnancy's key dates as a vertical timeline (stations), each
 * with its week, calendar date and a live "done / today / in N days" status. Grows with the
 * column (lg:flex-1).
 */
const STATIONS: { key: string; ga: number; color: string }[] = [
  { key: "lmp", ga: 0, color: "#64748b" },
  { key: "conception", ga: 14, color: "#06b6d4" },
  { key: "t2", ga: 98, color: TRIMESTERS[1].color },
  { key: "t3", ga: 196, color: TRIMESTERS[2].color },
  { key: "early", ga: 259, color: ZONES[1].color },
  { key: "full", ga: 273, color: ZONES[2].color },
  { key: "due", ga: 280, color: "#2563eb" },
  { key: "post", ga: 294, color: ZONES[4].color },
];

export default function DueDateKeyDates() {
  const t = useTranslations("tools.due-date-calculator.visuals.keyDates");
  const { snap } = useDueLive();
  const f = useDateFmt();

  return (
    <SectionCard title={t("title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="flex flex-col p-4 lg:flex-1 lg:p-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      <ol className="relative mt-3 flex flex-1 flex-col">
        <span aria-hidden className="absolute bottom-3 top-3 w-0.5 bg-zinc-200 start-[7px] dark:bg-zinc-700" />
        {STATIONS.map((s) => {
          const day = snap.lmp + s.ga;
          const diff = day - snap.today;
          const done = diff < 0;
          const status = diff === 0 ? t("today") : done ? t("done") : t("inDays", { n: diff });
          const isDue = s.key === "due";
          return (
            <li key={s.key} className="relative flex flex-1 items-center gap-3 py-1.5 ps-6">
              <span
                aria-hidden
                className="absolute start-0 h-4 w-4 rounded-full border-2"
                style={{ borderColor: s.color, background: done || diff === 0 ? s.color : "transparent" }}
              />
              <span className="min-w-0 flex-1">
                <span className={`block text-sm ${isDue ? "font-bold text-blue-700 dark:text-blue-300" : "font-medium text-zinc-900 dark:text-zinc-100"}`}>{t(`rows.${s.key}`)}</span>
                <span dir="ltr" className="block text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {wd(s.ga)} · {f.long(day)}
                </span>
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${done ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"}`}>
                {status}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-800 dark:bg-sky-500/10 dark:text-sky-200">{t("note")}</p>
    </SectionCard>
  );
}
