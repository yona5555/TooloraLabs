"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { convertAmount } from "@/lib/currency";
import { useFuelLiveInputs } from "./FuelLiveInputsContext";
import SectionCard from "@/components/tool-ui/SectionCard";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";
import { ltrIsolate } from "@/lib/bidi";

/**
 * Fixed illustrative comparison (not live-recalculated) — typical cost to
 * drive 100 km for four vehicle classes at a fixed reference fuel price,
 * distinct from FuelEfficiencyGauge (which compares raw L/100km efficiency,
 * not cost) and from FuelFlowDiagram (which traces one live calculation's
 * own distance -> fuel -> cost chain). Shown as vertical columns (not the
 * page's other horizontal-bar diagrams) so the four vehicle classes read as
 * a lineup to scan left-to-right.
 */
const REFERENCE_PRICE_PER_LITER = 1.5;
const VEHICLES: { key: string; litersPer100km: number }[] = [
  { key: "hybrid", litersPer100km: 4.5 },
  { key: "sedan", litersPer100km: 7 },
  { key: "suv", litersPer100km: 10 },
  { key: "pickup", litersPer100km: 13 },
];

const WIDTH = 320;
const HEIGHT = 160;
const COL_WIDTH = 46;
const COL_GAP = 24;
const PAD_TOP = 24;
const PAD_BOTTOM = 40;

export default function FuelCostComparisonDiagram() {
  const d = useTranslations("tools.fuel-cost-calculator.costComparisonDiagram");
  const tVehicles = useTranslations("tools.fuel-cost-calculator.costComparisonDiagram.vehicles");
  const tf = useTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const tw = useTranslations("tools.fuel-cost-calculator.workedExample");
  const live = useFuelLiveInputs();
  const currency = live?.currency ?? "USD";
  const digitStyle = live?.digitStyle ?? "western";
  const money = (usd: number) => formatLocalizedNumber(convertAmount(usd, "USD", currency), digitStyle, { style: "currency", currency, maximumFractionDigits: 2 });

  const costs = VEHICLES.map((v) => v.litersPer100km * REFERENCE_PRICE_PER_LITER);
  const maxCost = Math.max(...costs);
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const startX = (WIDTH - (VEHICLES.length * COL_WIDTH + (VEHICLES.length - 1) * COL_GAP)) / 2;

  const exampleIndex = 2; // SUV — a representative mid-pack vehicle class
  const example = { key: VEHICLES[exampleIndex].key, cost: costs[exampleIndex] };
  const reference = { key: VEHICLES[1].key, cost: costs[1] }; // Sedan — for the cost comparison
  const cheapest = { key: VEHICLES[0].key, cost: costs[0] };
  const priciest = { key: VEHICLES[3].key, cost: costs[3] };

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 overflow-x-auto">
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={d("title")} className="mx-auto block min-w-[300px] text-current">
            <line x1={16} y1={HEIGHT - PAD_BOTTOM} x2={WIDTH - 16} y2={HEIGHT - PAD_BOTTOM} className="stroke-current opacity-20" strokeWidth={1} />
            {VEHICLES.map((v, i) => {
              const cost = costs[i];
              const colHeight = (cost / maxCost) * plotHeight;
              const x = startX + i * (COL_WIDTH + COL_GAP);
              const y = HEIGHT - PAD_BOTTOM - colHeight;
              return (
                <g key={v.key}>
                  <rect x={x} y={y} width={COL_WIDTH} height={colHeight} rx={6} className="fill-indigo-500/80 dark:fill-indigo-400/80" />
                  <text x={x + COL_WIDTH / 2} y={y - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
                    {money(cost)}
                  </text>
                  <text x={x + COL_WIDTH / 2} y={HEIGHT - PAD_BOTTOM + 18} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75}>
                    {tVehicles(v.key)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tf("price"), value: `${money(REFERENCE_PRICE_PER_LITER)}/L` },
            { label: d("vehicleLabel"), value: tVehicles(example.key) },
            {
              label: d("costPer100kmLabel"),
              value: money(example.cost),
              emphasize: true,
              note: tw("comparisonMore", {
                amount: ltrIsolate(money(example.cost - reference.cost)),
                label: `${tVehicles(reference.key)} (${ltrIsolate(money(reference.cost))})`,
              }),
            },
            { label: d("mostEfficientLabel"), value: money(cheapest.cost) },
            { label: d("leastEfficientLabel"), value: money(priciest.cost) },
          ]}
        />
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption", { price: money(REFERENCE_PRICE_PER_LITER) })}</p>
    </SectionCard>
  );
}
