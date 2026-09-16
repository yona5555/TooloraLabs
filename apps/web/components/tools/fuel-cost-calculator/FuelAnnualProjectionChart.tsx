import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduLineChart from "./EduLineChart";

/** Cumulative cost at 3/6/9/12 months for a fixed monthly distance — same cost formula, projected over time as a running total, best read as a trend line. */
const MONTHLY_DISTANCE = 1000;
const EFFICIENCY = 25;
const PRICE = 3.5;
const MONTHLY_COST = (MONTHLY_DISTANCE / EFFICIENCY) * PRICE;
const MONTH_MARKS = [3, 6, 9, 12];

export default async function FuelAnnualProjectionChart() {
  const t = await getTranslations("tools.fuel-cost-calculator.annualProjectionChart");

  const points = MONTH_MARKS.map((months) => {
    const cost = MONTHLY_COST * months;
    return { x: months, label: t("months", { count: months }), value: cost, formatted: `$${Math.round(cost).toLocaleString("en-US")}` };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t("caption", { distance: MONTHLY_DISTANCE.toLocaleString("en-US"), efficiency: EFFICIENCY, price: PRICE.toFixed(2) })}
      </p>
      <div className="mt-4">
        <EduLineChart points={points} ariaLabel={t("title")} lineColorClass="stroke-violet-500 dark:stroke-violet-400" dotColorClass="fill-violet-500 dark:fill-violet-400" />
      </div>
    </SectionCard>
  );
}
