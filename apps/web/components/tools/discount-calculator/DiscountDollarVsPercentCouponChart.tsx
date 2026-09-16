import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "./EduBarChart";

/** Real crossover-point math: a flat $20-off coupon vs a 20%-off coupon, applied via the tool's own formula at two real price points either side of the $100 breakeven. */
const FLAT_OFF = 20;
const PERCENT_OFF = 20;
const PRICES = [80, 150];

export default async function DiscountDollarVsPercentCouponChart() {
  const t = await getTranslations("tools.discount-calculator.dollarVsPercentCouponChart");

  const bars = PRICES.flatMap((price) => {
    const flatFinal = price - FLAT_OFF;
    const percentFinal = price * (1 - PERCENT_OFF / 100);
    return [
      { label: t("flatAt", { price, flat: FLAT_OFF }), value: flatFinal, formatted: `$${flatFinal.toFixed(2)}` },
      { label: t("percentAt", { price, percent: PERCENT_OFF }), value: percentFinal, formatted: `$${percentFinal.toFixed(2)}` },
    ];
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { flat: FLAT_OFF, percent: PERCENT_OFF })}</p>
      <div className="mt-4">
        <EduBarChart bars={bars} ariaLabel={t("title")} barColorClass="fill-amber-500/80 dark:fill-amber-400/80" />
      </div>
    </SectionCard>
  );
}
