import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real math insight: two sequential discounts (20% then 10%) are NOT the same as one flat 30% discount, since the second % applies to an already-reduced price — a direct two-value comparison, not a bar list. */
const PRICE = 120;
const STACKED_FINAL = PRICE * (1 - 0.2) * (1 - 0.1);
const FLAT_FINAL = PRICE * (1 - 0.3);

export default async function DiscountStackedVsCombinedChart() {
  const t = await getTranslations("tools.discount-calculator.stackedVsCombinedChart");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { price: PRICE.toFixed(2) })}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="flex flex-1 flex-col items-center rounded-lg border border-sky-300 bg-sky-50 px-4 py-5 dark:border-sky-500/40 dark:bg-sky-500/10">
          <span className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-300">{t("stacked")}</span>
          <span className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-200">${STACKED_FINAL.toFixed(2)}</span>
        </div>
        <svg width={40} height={24} viewBox="0 0 40 24" role="img" aria-label="≠" className="shrink-0 text-current opacity-50">
          <line x1={6} y1={9} x2={34} y2={9} stroke="currentColor" strokeWidth={2} />
          <line x1={6} y1={15} x2={34} y2={15} stroke="currentColor" strokeWidth={2} />
          <line x1={22} y1={2} x2={12} y2={22} stroke="currentColor" strokeWidth={2} />
        </svg>
        <div className="flex flex-1 flex-col items-center rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-5 dark:border-indigo-500/40 dark:bg-indigo-500/10">
          <span className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{t("flat")}</span>
          <span className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-200">${FLAT_FINAL.toFixed(2)}</span>
        </div>
      </div>
      <p className="mt-3 text-xs opacity-60">{t("note")}</p>
    </SectionCard>
  );
}
