import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real math insight: two sequential discounts (20% then 10%) are NOT the same as one flat 30% discount, since the second % applies to an already-reduced price. */
const PRICE = 120;
const STACKED_FINAL = PRICE * (1 - 0.2) * (1 - 0.1);
const FLAT_FINAL = PRICE * (1 - 0.3);
const DIFFERENCE = STACKED_FINAL - FLAT_FINAL;

/**
 * Two structurally-identical scenario cards (§31 type #16). Previously
 * joined by a bare "≠" glyph between them — the banned "bordered boxes
 * linked by a symbol" pattern — removed outright; the difference figure
 * below now carries that relationship instead of a decorative connector.
 */
export default async function DiscountStackedVsCombinedChart() {
  const t = await getTranslations("tools.discount-calculator.stackedVsCombinedChart");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { price: PRICE.toFixed(2) })}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center rounded-xl border border-sky-300 bg-sky-50 px-4 py-5 dark:border-sky-500/40 dark:bg-sky-500/10">
          <span className="text-xs font-medium tracking-wide text-sky-600 uppercase dark:text-sky-300">{t("stacked")}</span>
          <span className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-200">${STACKED_FINAL.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-5 dark:border-indigo-500/40 dark:bg-indigo-500/10">
          <span className="text-xs font-medium tracking-wide text-indigo-600 uppercase dark:text-indigo-300">{t("flat")}</span>
          <span className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-200">${FLAT_FINAL.toFixed(2)}</span>
        </div>
      </div>
      <p dir="ltr" className="mt-3 text-center text-sm font-semibold text-indigo-700 dark:text-indigo-300">
        {t("differenceLabel")}: ${DIFFERENCE.toFixed(2)}
      </p>
      <p className="mt-1 text-center text-xs opacity-60">{t("note")}</p>
    </SectionCard>
  );
}
