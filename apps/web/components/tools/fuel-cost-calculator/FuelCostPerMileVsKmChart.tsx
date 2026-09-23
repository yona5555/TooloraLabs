import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";
import { ltrIsolate } from "@/lib/bidi";

/** Same trip's cost-per-distance figure (the tool's own output field), expressed per mile vs per km via the real 1 mi = 1.60934 km conversion — a direct side-by-side comparison, not a multi-row bar list, since there are only two real values. */
const DISTANCE = 300;
const EFFICIENCY = 30;
const PRICE = 3.5;
const TOTAL_COST = (DISTANCE / EFFICIENCY) * PRICE;
const COST_PER_MILE = TOTAL_COST / DISTANCE;
const COST_PER_KM = COST_PER_MILE / 1.60934;

export default async function FuelCostPerMileVsKmChart() {
  const t = await getTranslations("tools.fuel-cost-calculator.costPerMileVsKmChart");
  const tf = await getTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const td = await getTranslations("tools.fuel-cost-calculator.diagram");
  const tw = await getTranslations("tools.fuel-cost-calculator.workedExample");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { cost: TOTAL_COST.toFixed(2), distance: DISTANCE })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 items-center justify-center gap-4">
          <div className="flex flex-col items-center rounded-lg border border-sky-300 bg-sky-50 px-4 py-5 dark:border-sky-500/40 dark:bg-sky-500/10">
            <span className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-300">{t("perMile")}</span>
            <span className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-200">${COST_PER_MILE.toFixed(2)}</span>
          </div>
          <svg width={40} height={24} viewBox="0 0 40 24" role="img" aria-label="=" className="shrink-0 text-current opacity-50">
            <line x1={4} y1={8} x2={32} y2={8} stroke="currentColor" strokeWidth={2} />
            <line x1={4} y1={16} x2={32} y2={16} stroke="currentColor" strokeWidth={2} />
          </svg>
          <div className="flex flex-col items-center rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-5 dark:border-indigo-500/40 dark:bg-indigo-500/10">
            <span className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{t("perKm")}</span>
            <span className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-200">${COST_PER_KM.toFixed(2)}</span>
          </div>
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tf("distance"), value: `${DISTANCE} mi` },
            { label: td("totalCost"), value: `$${TOTAL_COST.toFixed(2)}` },
            {
              label: t("perMile"),
              value: `$${COST_PER_MILE.toFixed(2)}`,
              emphasize: true,
              note: tw("comparisonTimes", { multiple: ltrIsolate((COST_PER_MILE / COST_PER_KM).toFixed(2)), label: `${t("perKm")} (${ltrIsolate(`$${COST_PER_KM.toFixed(2)}`)})` }),
            },
            { label: t("perKm"), value: `$${COST_PER_KM.toFixed(2)}` },
            { label: t("per100kmLabel"), value: `$${(COST_PER_KM * 100).toFixed(2)}` },
          ]}
        />
      </div>
      <p className="mt-3 text-center text-xs opacity-60">1 mi = 1.60934 km</p>
    </SectionCard>
  );
}
