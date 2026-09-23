"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { convertAmount } from "@/lib/currency";
import { useFuelLiveInputs } from "./FuelLiveInputsContext";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduDonutChart from "./EduDonutChart";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";
import { ltrIsolate } from "@/lib/bidi";

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

export default function FuelTypeCostComparisonChart() {
  const t = useTranslations("tools.fuel-cost-calculator.typeCostComparisonChart");
  const tSources = useTranslations("tools.fuel-cost-calculator.typeCostComparisonChart.sources");
  const tf = useTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const tw = useTranslations("tools.fuel-cost-calculator.workedExample");
  const live = useFuelLiveInputs();
  const currency = live?.currency ?? "USD";
  const digitStyle = live?.digitStyle ?? "western";
  const money = (usd: number) => formatLocalizedNumber(convertAmount(usd, "USD", currency), digitStyle, { style: "currency", currency, maximumFractionDigits: 2 });

  const segments = SOURCES.map((s) => {
    const cost = (DISTANCE / s.rate) * s.price;
    return { key: s.key, label: tSources(s.key), value: cost, formatted: money(cost), colorClass: s.colorClass, dotColorClass: s.dotColorClass };
  });

  const cheapest = segments.reduce((min, s) => (s.value < min.value ? s : min), segments[0]);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { distance: DISTANCE })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduDonutChart segments={segments} ariaLabel={t("title")} />
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tf("distance"), value: `${DISTANCE} mi` },
            ...segments.map((s) => ({
              label: s.label,
              value: s.formatted,
              emphasize: s.key === "gasoline",
              note:
                s.key === "gasoline"
                  ? tw("comparisonMore", {
                      amount: ltrIsolate(money(s.value - cheapest.value)),
                      label: `${cheapest.label} (${ltrIsolate(cheapest.formatted)})`,
                    })
                  : undefined,
            })),
          ]}
        />
      </div>
      <p className="mt-3 text-xs opacity-60">{t("note")}</p>
    </SectionCard>
  );
}
