import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduLineChart from "./EduLineChart";

/** Real bulk-discount tiering example: unit price at four real quantity tiers, same $20 base unit price — a continuous "the more you buy, the cheaper each unit gets" curve, best read as a line. */
const UNIT_PRICE = 20;
const TIERS = [
  { key: "single", qty: 1, percent: 0 },
  { key: "small", qty: 5, percent: 10 },
  { key: "medium", qty: 10, percent: 20 },
  { key: "large", qty: 25, percent: 30 },
];

export default async function DiscountBulkQuantityChart() {
  const t = await getTranslations("tools.discount-calculator.bulkQuantityChart");
  const tTiers = await getTranslations("tools.discount-calculator.bulkQuantityChart.tiers");

  const points = TIERS.map((tier) => {
    const unitFinal = UNIT_PRICE * (1 - tier.percent / 100);
    return { x: tier.qty, label: tTiers(tier.key, { qty: tier.qty }), value: unitFinal, formatted: `$${unitFinal.toFixed(2)}` };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { price: UNIT_PRICE.toFixed(2) })}</p>
      <div className="mt-4">
        <EduLineChart points={points} ariaLabel={t("title")} lineColorClass="stroke-violet-500 dark:stroke-violet-400" dotColorClass="fill-violet-500 dark:fill-violet-400" />
      </div>
    </SectionCard>
  );
}
