"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { convertAmount } from "@/lib/currency";
import { useFuelLiveInputs } from "./FuelLiveInputsContext";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "./EduBarChart";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";
import { ltrIsolate } from "@/lib/bidi";

/** Same distance & efficiency, four realistic price points — shows the tool's own linear cost-vs-price relationship. */
const DISTANCE = 300;
const EFFICIENCY = 30;
const PRICES = [2.5, 3.0, 3.5, 4.0];
const STEP = 0.5; // the price step between adjacent PRICES entries, and this chart's own "rate of rise" step

export default function FuelPriceBandChart() {
  const t = useTranslations("tools.fuel-cost-calculator.priceBandChart");
  const tf = useTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const td = useTranslations("tools.fuel-cost-calculator.diagram");
  const tw = useTranslations("tools.fuel-cost-calculator.workedExample");
  const live = useFuelLiveInputs();
  const currency = live?.currency ?? "USD";
  const digitStyle = live?.digitStyle ?? "western";
  const money = (usd: number) => formatLocalizedNumber(convertAmount(usd, "USD", currency), digitStyle, { style: "currency", currency, maximumFractionDigits: 2 });

  const bars = PRICES.map((price) => {
    const cost = (DISTANCE / EFFICIENCY) * price;
    return { label: money(price), value: cost, formatted: money(cost) };
  });

  const example = bars[2]; // $3.50/gal — the same reference price used elsewhere in this tool's education content
  const cheapest = bars[0]; // $2.50/gal — the lowest price shown, for the price comparison
  const priciest = bars[3]; // $4.00/gal — the highest price shown, for the cost comparison
  const stepCost = (DISTANCE / EFFICIENCY) * STEP; // cost added per price-step rise, at this fixed distance/efficiency

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { distance: DISTANCE, efficiency: EFFICIENCY })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} barColorClass="fill-amber-500/80 dark:fill-amber-400/80" />
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tf("distance"), value: `${DISTANCE} mi` },
            { label: tf("efficiency"), value: `${EFFICIENCY} mpg` },
            {
              label: tf("price"),
              value: example.label,
              note: tw("comparisonMore", { amount: ltrIsolate(money(PRICES[2] - PRICES[0])), label: ltrIsolate(cheapest.label) }),
            },
            {
              label: td("totalCost"),
              value: example.formatted,
              emphasize: true,
              note: tw("comparisonLess", {
                amount: ltrIsolate(money(priciest.value - example.value)),
                label: ltrIsolate(`${priciest.label}/gal (${priciest.formatted})`),
              }),
            },
            { label: t("rateLabel", { step: money(STEP) }), value: `+${money(stepCost)}` },
          ]}
        />
      </div>
    </SectionCard>
  );
}
