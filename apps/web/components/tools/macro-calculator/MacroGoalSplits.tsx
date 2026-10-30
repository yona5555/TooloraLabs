"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useMacroLive } from "./MacroLiveContext";
import { COLORS, GOALS, MACROS, SYMBOL, k0, splitFor } from "./macros";

/**
 * Input-column filler (§27): the four goal splits at the live calorie total, each as a stacked
 * bar with its grams. Clicking a row sets the calculator's goal. Grows with the column (lg:flex-1).
 */
export default function MacroGoalSplits() {
  const t = useTranslations("tools.macro-calculator.visuals.goalSplits");
  const tGoals = useTranslations("tools.macro-calculator.goals.labels");
  const { snap, setGoal } = useMacroLive();

  return (
    <SectionCard title={t("title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { kcal: `${k0(snap.calories)} kcal` })}</p>
      <div className="mt-4 flex flex-col gap-3 lg:flex-1 lg:justify-around">
        {GOALS.map((g) => {
          const sp = splitFor(snap.calories, g);
          if (!sp) return null;
          const on = g === snap.goal;
          return (
            <button
              key={g}
              type="button"
              aria-pressed={on}
              onClick={() => setGoal(g)}
              className={`w-full rounded-xl border p-3 text-start transition ${
                on ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10" : "border-zinc-200 hover:border-blue-300 dark:border-zinc-700"
              }`}
            >
              <span className={`block text-sm font-semibold ${on ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-200"}`}>{tGoals(g)}</span>
              <span dir="ltr" className="mt-2 flex h-5 overflow-hidden rounded-md">
                {MACROS.map((m) => (
                  <span
                    key={m}
                    className="flex items-center justify-center text-xs font-bold text-white tabular-nums"
                    style={{ width: `${sp[m].percent}%`, background: COLORS[m] }}
                  >
                    {Math.round(sp[m].percent)}%
                  </span>
                ))}
              </span>
              <span dir="ltr" className="mt-1.5 flex justify-between text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
                {MACROS.map((m) => (
                  <span key={m}>
                    <b style={{ color: COLORS[m] }}>{SYMBOL[m]}</b> {k0(sp[m].grams)} g
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
