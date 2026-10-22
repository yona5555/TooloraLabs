"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { f1 } from "@/components/tool-ui/indicator-kit/format";
import { useBMRLive } from "./BMRLiveContext";
import { BANDS, bandOf, k0, weightForBmr } from "./bmr";

/**
 * Input-column reference (§17/§27): the three BMR ranges as a tagged live table, each with the
 * body weight that lands in it for the current height, age, sex and formula. The current range
 * is tagged; its rows grow so the column ends flush with the Result card.
 */
export default function BMRRangeLadder() {
  const t = useTranslations("tools.bmr-calculator.visuals.ladder");
  const tRange = useTranslations("tools.bmr-calculator.result.range");
  const { body: b, which, bmr } = useBMRLive();
  const now = bandOf(bmr);
  const wkg = (kcal: number) => Math.max(0, weightForBmr(b, kcal, which));

  return (
    <SectionCard title={t("title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="flex flex-col p-4 lg:flex-1 lg:p-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <span>{t("colRange")}</span>
        <span className="text-end">{t("colBmr")}</span>
        <span className="w-24 text-end">{t("colWeight")}</span>
      </div>
      <ul className="mt-1 flex flex-1 flex-col gap-1.5">
        {BANDS.map((c, i) => {
          const on = c.key === now.key;
          const kcal = i === 0 ? `< ${k0(c.max)}` : i === BANDS.length - 1 ? `≥ ${k0(c.min)}` : `${k0(c.min)}–${k0(c.max)}`;
          const kg = i === 0 ? `< ${f1(wkg(c.max))}` : i === BANDS.length - 1 ? `≥ ${f1(wkg(c.min))}` : `${f1(wkg(c.min))}–${f1(wkg(c.max))}`;
          return (
            <li
              key={c.key}
              className={`grid flex-1 grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-lg border px-3 py-2 text-sm ${
                on ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10" : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{tRange(c.key)}</span>
                {on && <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">{t("you", { kcal: k0(bmr) })}</span>}
              </span>
              <span dir="ltr" className="text-end tabular-nums text-zinc-700 dark:text-zinc-300">
                {kcal}
              </span>
              <span dir="ltr" className="w-24 text-end tabular-nums text-zinc-700 dark:text-zinc-300">
                {kg}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
        {t("note", { hour: f1(bmr / 24), watts: f1((bmr * 4184) / 86400) })}
      </p>
    </SectionCard>
  );
}
