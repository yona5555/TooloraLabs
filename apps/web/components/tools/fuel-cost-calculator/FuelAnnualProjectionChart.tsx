"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { convertAmount } from "@/lib/currency";
import { useFuelLiveInputs } from "./FuelLiveInputsContext";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduLineChart from "./EduLineChart";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";
import { ltrIsolate } from "@/lib/bidi";

/** Cumulative cost at 3/6/9/12 months for a fixed monthly distance — same cost formula, projected over time as a running total, best read as a trend line. */
const MONTHLY_DISTANCE = 1000;
const EFFICIENCY = 25;
const PRICE = 3.5;
const MONTHLY_COST = (MONTHLY_DISTANCE / EFFICIENCY) * PRICE;
const MONTH_MARKS = [3, 6, 9, 12];

export default function FuelAnnualProjectionChart() {
  const t = useTranslations("tools.fuel-cost-calculator.annualProjectionChart");
  const tf = useTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const td = useTranslations("tools.fuel-cost-calculator.diagram");
  const tw = useTranslations("tools.fuel-cost-calculator.workedExample");
  const live = useFuelLiveInputs();
  const currency = live?.currency ?? "USD";
  const digitStyle = live?.digitStyle ?? "western";
  const money = (usd: number, maximumFractionDigits = 0) =>
    formatLocalizedNumber(convertAmount(usd, "USD", currency), digitStyle, { style: "currency", currency, maximumFractionDigits });

  const points = MONTH_MARKS.map((months) => {
    const cost = MONTHLY_COST * months;
    return { x: months, label: t("months", { count: months }), value: cost, formatted: money(cost) };
  });

  const finalPoint = points[points.length - 1]; // 12 months — the chart's own last plotted value
  const firstPoint = points[0]; // 3 months — the chart's own first plotted value, for the total-cost comparison

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t("caption", { distance: MONTHLY_DISTANCE.toLocaleString("en-US"), efficiency: EFFICIENCY, price: money(PRICE, 2) })}
      </p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduLineChart points={points} ariaLabel={t("title")} lineColorClass="stroke-violet-500 dark:stroke-violet-400" dotColorClass="fill-violet-500 dark:fill-violet-400" />
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tf("distance"), value: `${MONTHLY_DISTANCE.toLocaleString("en-US")} mi/mo` },
            { label: tf("efficiency"), value: `${EFFICIENCY} mpg` },
            { label: tf("price"), value: money(PRICE, 2) },
            { label: t("monthlyCostLabel"), value: money(MONTHLY_COST), emphasize: true, note: `× ${finalPoint.label}` },
            {
              label: td("totalCost"),
              value: finalPoint.formatted,
              emphasize: true,
              note: tw("comparisonTimes", {
                multiple: ltrIsolate((finalPoint.value / firstPoint.value).toFixed(0)),
                label: `${firstPoint.label} (${ltrIsolate(firstPoint.formatted)})`,
              }),
            },
          ]}
        />
      </div>
    </SectionCard>
  );
}
