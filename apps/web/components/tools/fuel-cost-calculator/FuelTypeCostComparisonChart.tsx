import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduDonutChart from "./EduDonutChart";

/**
 * Same 300-mile trip, run through the tool's own cost = distance / rate * price formula
 * with four real-world power-source benchmarks (typical US averages). The tool itself is
 * unit-agnostic (it just takes a rate and a price-per-unit), so these are valid inputs to
 * that same formula, not a feature the tool computes on its own. Shown as a donut to read
 * as "how the same trip's cost splits across power-source choices."
 */
const DISTANCE = 300;
const SOURCES = [
  { key: "gasoline", rate: 30, price: 3.5, colorClass: "stroke-amber-500 dark:stroke-amber-400", dotColorClass: "bg-amber-500 dark:bg-amber-400" },
  { key: "diesel", rate: 35, price: 3.8, colorClass: "stroke-rose-500 dark:stroke-rose-400", dotColorClass: "bg-rose-500 dark:bg-rose-400" },
  { key: "hybrid", rate: 50, price: 3.5, colorClass: "stroke-emerald-500 dark:stroke-emerald-400", dotColorClass: "bg-emerald-500 dark:bg-emerald-400" },
  { key: "electric", rate: 3.5, price: 0.15, colorClass: "stroke-sky-500 dark:stroke-sky-400", dotColorClass: "bg-sky-500 dark:bg-sky-400" },
];

export default async function FuelTypeCostComparisonChart() {
  const t = await getTranslations("tools.fuel-cost-calculator.typeCostComparisonChart");
  const tSources = await getTranslations("tools.fuel-cost-calculator.typeCostComparisonChart.sources");

  const segments = SOURCES.map((s) => {
    const cost = (DISTANCE / s.rate) * s.price;
    return { key: s.key, label: tSources(s.key), value: cost, formatted: `$${cost.toFixed(2)}`, colorClass: s.colorClass, dotColorClass: s.dotColorClass };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { distance: DISTANCE })}</p>
      <div className="mt-4">
        <EduDonutChart segments={segments} ariaLabel={t("title")} />
      </div>
      <p className="mt-3 text-xs opacity-60">{t("note")}</p>
    </SectionCard>
  );
}
