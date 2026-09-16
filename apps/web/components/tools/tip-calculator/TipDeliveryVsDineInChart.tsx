import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduDonutChart from "./EduDonutChart";

/** Documented service-type tipping conventions (distinct from country-based norms): delivery vs dine-in, same $30 order — shown as a donut split rather than a bar list. */
const ORDER = 30;
const SERVICE_TYPES = [
  { key: "delivery", percent: 12, colorClass: "stroke-amber-500 dark:stroke-amber-400", dotColorClass: "bg-amber-500 dark:bg-amber-400" },
  { key: "dineIn", percent: 18, colorClass: "stroke-emerald-500 dark:stroke-emerald-400", dotColorClass: "bg-emerald-500 dark:bg-emerald-400" },
];

export default async function TipDeliveryVsDineInChart() {
  const t = await getTranslations("tools.tip-calculator.deliveryVsDineInChart");
  const tTypes = await getTranslations("tools.tip-calculator.deliveryVsDineInChart.types");

  const segments = SERVICE_TYPES.map((s) => {
    const tip = ORDER * (s.percent / 100);
    return { key: s.key, label: `${tTypes(s.key)} (${s.percent}%)`, value: tip, formatted: `$${tip.toFixed(2)}`, colorClass: s.colorClass, dotColorClass: s.dotColorClass };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { order: ORDER.toFixed(2) })}</p>
      <div className="mt-4">
        <EduDonutChart segments={segments} ariaLabel={t("title")} />
      </div>
    </SectionCard>
  );
}
