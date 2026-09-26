import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real, direct look at the tool's own dollar impact: bill alone vs bill + tip. */
const BILL = 85;
const TIP_PERCENT = 18;
const TOTAL = BILL * (1 + TIP_PERCENT / 100);
const TIP_AMOUNT = TOTAL - BILL;

/**
 * Two structurally-identical scenario cards (§31 type #16). Previously
 * joined by a bare "+" glyph between them — the banned "bordered boxes
 * linked by a symbol" pattern — removed outright; the tip-added figure
 * below now carries that relationship instead of a decorative connector.
 */
export default async function TipVsNoTipComparisonChart() {
  const t = await getTranslations("tools.tip-calculator.vsNoTipComparisonChart");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center rounded-xl border border-sky-300 bg-sky-50 px-4 py-5 dark:border-sky-500/40 dark:bg-sky-500/10">
          <span className="text-xs font-medium tracking-wide text-sky-600 uppercase dark:text-sky-300">{t("billOnly")}</span>
          <span className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-200">${BILL.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-5 dark:border-indigo-500/40 dark:bg-indigo-500/10">
          <span className="text-xs font-medium tracking-wide text-indigo-600 uppercase dark:text-indigo-300">{t("withTip", { percent: TIP_PERCENT })}</span>
          <span className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-200">${TOTAL.toFixed(2)}</span>
        </div>
      </div>
      <p dir="ltr" className="mt-3 text-center text-sm font-semibold text-indigo-700 dark:text-indigo-300">
        {t("tipAddedLabel")}: +${TIP_AMOUNT.toFixed(2)}
      </p>
    </SectionCard>
  );
}
