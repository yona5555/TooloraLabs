"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useSleepLive } from "./SleepLiveContext";
import { clock, optionClock } from "./sleep";

const WAKE_TIMES = [300, 330, 360, 390, 420, 450, 480, 510];
const BED_TIMES = [1260, 1290, 1320, 1350, 1380, 1410, 0, 30];

/**
 * Input-column filler (§27): common wake-up times (or bedtimes) with their 6- and 5-cycle
 * answers at the live minutes-to-fall-asleep. Clicking a row sets the calculator's time.
 * Grows with the column (lg:flex-1).
 */
export default function SleepTimeLadder() {
  const t = useTranslations("tools.sleep-calculator.visuals.ladder");
  const { snap, setAnchor } = useSleepLive();
  const wakeUp = snap.mode === "wakeUp";
  const times = wakeUp ? WAKE_TIMES : BED_TIMES;

  return (
    <SectionCard title={t("title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="flex flex-col p-4 lg:flex-1 lg:p-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t(wakeUp ? "introWake" : "introBed", { latency: `${snap.latency} min` })}</p>
      <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <span>{t(wakeUp ? "colWake" : "colBed")}</span>
        <span className="w-20 text-end">{t("col6")}</span>
        <span className="w-20 text-end">{t("col5")}</span>
      </div>
      <ul className="mt-1 flex flex-1 flex-col gap-1.5">
        {times.map((m) => {
          const on = m === snap.anchor;
          return (
            <li key={m} className="flex flex-1">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setAnchor(m)}
                className={`grid flex-1 grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-lg border px-3 py-2 text-start text-sm transition ${
                  on ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10" : "border-zinc-200 hover:border-blue-300 dark:border-zinc-700"
                }`}
              >
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span dir="ltr" className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                    {clock(m)}
                  </span>
                </span>
                {[6, 5].map((c) => (
                  <span key={c} dir="ltr" className={`w-20 text-end font-semibold tabular-nums ${c === 6 ? "text-indigo-700 dark:text-indigo-300" : "text-blue-700 dark:text-blue-300"}`}>
                    {clock(optionClock(snap.mode, m, snap.latency, c))}
                  </span>
                ))}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs leading-5 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200">{t("note")}</p>
    </SectionCard>
  );
}
