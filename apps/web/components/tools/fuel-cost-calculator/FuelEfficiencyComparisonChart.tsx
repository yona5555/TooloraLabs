import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduLineChart from "./EduLineChart";

/** Same annual distance & price, five real-world efficiency levels — the tool's own inverse relationship (cost = distance / efficiency * price) is a continuous curve, so a line reads it better than discrete bars. */
const ANNUAL_DISTANCE = 12000;
const PRICE = 3.5;
const EFFICIENCIES = [20, 25, 30, 35, 40];

export default async function FuelEfficiencyComparisonChart() {
  const t = await getTranslations("tools.fuel-cost-calculator.efficiencyComparisonChart");

  const points = EFFICIENCIES.map((mpg) => {
    const cost = (ANNUAL_DISTANCE / mpg) * PRICE;
    return { x: mpg, label: `${mpg}`, value: cost, formatted: `$${Math.round(cost).toLocaleString("en-US")}` };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { distance: ANNUAL_DISTANCE.toLocaleString("en-US"), price: PRICE.toFixed(2) })}</p>
      <div className="mt-4">
        <EduLineChart points={points} ariaLabel={t("title")} lineColorClass="stroke-emerald-500 dark:stroke-emerald-400" dotColorClass="fill-emerald-500 dark:fill-emerald-400" />
      </div>
    </SectionCard>
  );
}
