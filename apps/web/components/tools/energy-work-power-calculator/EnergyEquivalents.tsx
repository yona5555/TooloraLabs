"use client";
import { useTranslations } from "next-intl";
import { BULB_WATTS, energyEquivalents, energyUnits } from "@tooloralabs/tools";
import EnergyIndicatorCard, { EnergyIndicatorUnavailable } from "./EnergyIndicatorCard";
import { useEnergyModel } from "./EnergyLiveContext";

/**
 * Type #11 (Side-by-Side Equivalence): the energy behind the active formula (W, KE, PE, or the
 * work delivered in power mode) on the left, and the same amount on the right as a 60 W bulb's
 * running time, a 1 kg lift, 100 g apples raised 1 m, food Calories and watt-hours.
 */
export default function EnergyEquivalents() {
  const t = useTranslations("tools.energy-work-power-calculator.education.lab.equiv");
  const tForm = useTranslations("tools.energy-work-power-calculator.form");
  const { draft, activeEnergy: E, f } = useEnergyModel();
  if (E === 0 || !Number.isFinite(E)) return <EnergyIndicatorUnavailable title={t("title")} />;

  const e = energyEquivalents(E);
  const u = energyUnits(E);
  const rows = [
    { key: "bulb", value: f(e.bulbSeconds, 2), unit: "s", cls: "bg-amber-500 dark:bg-amber-400" },
    { key: "lift", value: f(e.liftOneKgMetres, 2), unit: "m", cls: "bg-blue-600 dark:bg-blue-400" },
    { key: "apples", value: f(e.appleLifts, 1), unit: "×", cls: "bg-red-500 dark:bg-red-400" },
    { key: "food", value: f(u.kcal, 4), unit: "kcal", cls: "bg-emerald-600 dark:bg-emerald-400" },
    { key: "wh", value: f(u.wh, 4), unit: "Wh", cls: "bg-violet-600 dark:bg-violet-400" },
  ];

  const indicator = (
    <div className="flex w-full max-w-[380px] flex-col items-stretch gap-3 sm:w-[380px] sm:flex-row">
      <div className="flex w-full shrink-0 flex-col items-center sm:w-[118px] justify-center rounded-xl border-2 border-blue-500 bg-blue-50 px-2 py-4 text-center dark:border-blue-400 dark:bg-blue-500/10">
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{tForm(`mode.${draft.mode}`)}</span>
        <span dir="ltr" className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">
          {f(E)}
        </span>
        <span className="text-xs text-blue-600 dark:text-blue-300">J</span>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs dark:border-zinc-700">
            <span aria-hidden className="text-sm font-bold text-zinc-400">=</span>
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${r.cls}`} />
            <span className="min-w-0 flex-1 text-zinc-600 dark:text-zinc-300">{t(r.key)}</span>
            <span dir="ltr" className="font-mono font-semibold whitespace-nowrap text-zinc-800 dark:text-zinc-100">{`${r.value} ${r.unit}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <EnergyIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("bulb"), value: `${f(E)} J / ${BULB_WATTS} W = ${f(e.bulbSeconds)} s` },
        { label: t("lift"), value: `${f(E)} / (1 kg × 9.8) = ${f(e.liftOneKgMetres)} m` },
        { label: t("apples"), value: `${f(E)} / 0.98 J = ${f(e.appleLifts, 1)}` },
        { label: t("food"), value: `${f(E)} / 4184 = ${f(u.kcal)} kcal`, emphasize: true },
      ]}
    />
  );
}
