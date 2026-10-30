"use client";
import { useLocale, useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { usePregnancyLive } from "./PregnancyLiveContext";
import { TRI_COLORS, acogTrimester, addDaysISO, fmtDate, milestoneFor } from "./preg";

const WEEKS = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];

/**
 * Input-column filler (§27): every fourth week with its calendar date for the entered LMP and the
 * calculator's size comparison. Clicking a row sets today to that week (the LMP moves). Grows with
 * the column (lg:flex-1).
 */
export default function PregnancyWeekLadder() {
  const t = useTranslations("tools.pregnancy-calculator.visuals.ladder");
  const tSize = useTranslations("tools.pregnancy-calculator.sizeComparisons");
  const locale = useLocale();
  const { snap, setGa } = usePregnancyLive();
  const current = WEEKS.filter((w) => w <= snap.weeks).pop() ?? WEEKS[0];

  return (
    <SectionCard title={t("title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="flex flex-col p-4 lg:flex-1 lg:p-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      <div className="mt-3 grid grid-cols-[3rem_1fr_auto] gap-x-3 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <span>{t("colWeek")}</span>
        <span>{t("colDate")}</span>
        <span className="text-end">{t("colSize")}</span>
      </div>
      <ul className="mt-1 flex flex-1 flex-col gap-1.5">
        {WEEKS.map((w) => {
          const on = w === current;
          const m = milestoneFor(w);
          return (
            <li key={w} className="flex flex-1">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setGa(w * 7)}
                className={`grid flex-1 grid-cols-[3rem_1fr_auto] items-center gap-x-3 rounded-lg border px-3 py-1.5 text-start text-sm transition ${
                  on ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10" : "border-zinc-200 hover:border-blue-300 dark:border-zinc-700"
                }`}
              >
                <span dir="ltr" className="flex items-center gap-1.5 font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: TRI_COLORS[acogTrimester(w * 7)] }} />
                  {w}w
                </span>
                <span className="min-w-0 truncate tabular-nums text-zinc-700 dark:text-zinc-200">{fmtDate(addDaysISO(snap.lmp, w * 7), locale)}</span>
                <span className="text-end text-xs font-semibold text-pink-700 dark:text-pink-300">{m ? tSize(m.sizeComparison) : ""}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 rounded-lg bg-pink-50 px-3 py-2 text-xs leading-5 text-pink-800 dark:bg-pink-500/10 dark:text-pink-200">{t("note")}</p>
    </SectionCard>
  );
}
