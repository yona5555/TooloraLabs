import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real psychological-pricing comparison: a $99.99-style charm price vs a round $100, same 20% discount applied via the tool's own formula. */
const DISCOUNT_PERCENT = 20;
const CHARM_ORIGINAL = 124.99;
const ROUND_ORIGINAL = 125;
const CHARM_FINAL = CHARM_ORIGINAL * (1 - DISCOUNT_PERCENT / 100);
const ROUND_FINAL = ROUND_ORIGINAL * (1 - DISCOUNT_PERCENT / 100);

/**
 * Two structurally-identical scenario cards (§31 type #16). Previously
 * joined by a bare "vs" glyph between them — the banned "bordered boxes
 * linked by a symbol" pattern — removed outright.
 */
export default async function DiscountRoundNumberPricingDiagram() {
  const t = await getTranslations("tools.discount-calculator.roundNumberPricingDiagram");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { percent: DISCOUNT_PERCENT })}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-5 dark:border-zinc-700 dark:bg-zinc-800/40">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("charmLabel", { price: CHARM_ORIGINAL.toFixed(2) })}</span>
          <span className="mt-1 text-2xl font-bold text-zinc-800 dark:text-zinc-100">${CHARM_FINAL.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-5 dark:border-zinc-700 dark:bg-zinc-800/40">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("roundLabel", { price: ROUND_ORIGINAL.toFixed(2) })}</span>
          <span className="mt-1 text-2xl font-bold text-zinc-800 dark:text-zinc-100">${ROUND_FINAL.toFixed(2)}</span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs opacity-60">{t("note")}</p>
    </SectionCard>
  );
}
