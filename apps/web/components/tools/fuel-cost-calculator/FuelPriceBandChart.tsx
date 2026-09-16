import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "./EduBarChart";

/** Same distance & efficiency, four realistic price points — shows the tool's own linear cost-vs-price relationship. */
const DISTANCE = 300;
const EFFICIENCY = 30;
const PRICES = [2.5, 3.0, 3.5, 4.0];

export default async function FuelPriceBandChart() {
  const t = await getTranslations("tools.fuel-cost-calculator.priceBandChart");

  const bars = PRICES.map((price) => {
    const cost = (DISTANCE / EFFICIENCY) * price;
    return { label: `$${price.toFixed(2)}`, value: cost, formatted: `$${cost.toFixed(2)}` };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { distance: DISTANCE, efficiency: EFFICIENCY })}</p>
      <div className="mt-4">
        <EduBarChart bars={bars} ariaLabel={t("title")} barColorClass="fill-amber-500/80 dark:fill-amber-400/80" />
      </div>
    </SectionCard>
  );
}
