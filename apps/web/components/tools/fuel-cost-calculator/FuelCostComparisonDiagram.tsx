"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Fixed illustrative comparison (not live-recalculated) — typical cost to
 * drive 100 km for four vehicle classes at a fixed reference fuel price,
 * distinct from FuelEfficiencyGauge (which compares raw L/100km efficiency,
 * not cost) and from FuelFlowDiagram (which traces one live calculation's
 * own distance -> fuel -> cost chain).
 */
const REFERENCE_PRICE_PER_LITER = 1.5;
const VEHICLES: { key: string; litersPer100km: number }[] = [
  { key: "hybrid", litersPer100km: 4.5 },
  { key: "sedan", litersPer100km: 7 },
  { key: "suv", litersPer100km: 10 },
  { key: "pickup", litersPer100km: 13 },
];

export default function FuelCostComparisonDiagram() {
  const d = useTranslations("tools.fuel-cost-calculator.costComparisonDiagram");
  const tVehicles = useTranslations("tools.fuel-cost-calculator.costComparisonDiagram.vehicles");

  const costs = VEHICLES.map((v) => v.litersPer100km * REFERENCE_PRICE_PER_LITER);
  const maxCost = Math.max(...costs);
  const barMaxWidth = 220;

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-3">
        {VEHICLES.map((v, i) => {
          const cost = costs[i];
          const width = (cost / maxCost) * barMaxWidth;
          return (
            <div key={v.key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs font-medium text-zinc-600 dark:text-zinc-300">{tVehicles(v.key)}</span>
              <div className="flex-1">
                <div className="h-6 rounded-md bg-blue-500/80 dark:bg-blue-400/80" style={{ width: `${width}px` }} />
              </div>
              <span className="w-16 shrink-0 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-200">${cost.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption", { price: REFERENCE_PRICE_PER_LITER.toFixed(2) })}</p>
    </SectionCard>
  );
}
