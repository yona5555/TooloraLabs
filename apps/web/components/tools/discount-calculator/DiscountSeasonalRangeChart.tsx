import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduDonutChart from "./EduDonutChart";

/** Typical documented US retail seasonal discount ranges, applied to the same $120 item via the tool's own formula — shown as a donut of final prices rather than a bar list. */
const PRICE = 120;
const SEASONS = [
  { key: "clearance", percent: 50, colorClass: "stroke-rose-500 dark:stroke-rose-400", dotColorClass: "bg-rose-500 dark:bg-rose-400" },
  { key: "blackFriday", percent: 35, colorClass: "stroke-amber-500 dark:stroke-amber-400", dotColorClass: "bg-amber-500 dark:bg-amber-400" },
  { key: "backToSchool", percent: 20, colorClass: "stroke-sky-500 dark:stroke-sky-400", dotColorClass: "bg-sky-500 dark:bg-sky-400" },
  { key: "regularSale", percent: 10, colorClass: "stroke-emerald-500 dark:stroke-emerald-400", dotColorClass: "bg-emerald-500 dark:bg-emerald-400" },
];

export default async function DiscountSeasonalRangeChart() {
  const t = await getTranslations("tools.discount-calculator.seasonalRangeChart");
  const tSeasons = await getTranslations("tools.discount-calculator.seasonalRangeChart.seasons");

  const segments = SEASONS.map((s) => {
    const final = PRICE * (1 - s.percent / 100);
    return { key: s.key, label: `${tSeasons(s.key)} (${s.percent}%)`, value: final, formatted: `$${final.toFixed(2)}`, colorClass: s.colorClass, dotColorClass: s.dotColorClass };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { price: PRICE.toFixed(2) })}</p>
      <div className="mt-4">
        <EduDonutChart segments={segments} ariaLabel={t("title")} />
      </div>
    </SectionCard>
  );
}
