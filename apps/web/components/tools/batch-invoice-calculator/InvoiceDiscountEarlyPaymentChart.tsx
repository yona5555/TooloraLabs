import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real 2/10 Net 30 terms (a standard, documented early-payment-discount convention): total with vs without the 2% discount. */
const TOTAL = 1186.45;
const DISCOUNT_PERCENT = 2;
const DISCOUNTED_TOTAL = TOTAL * (1 - DISCOUNT_PERCENT / 100);
const SAVINGS = TOTAL - DISCOUNTED_TOTAL;

/**
 * Two structurally-identical scenario cards (§31 type #16, Side-by-Side
 * Comparison Cards) for the same invoice total under two different payment
 * timings. Previously these two cards were joined by a bare connector line
 * — the banned "bordered boxes linked by a symbol" pattern (§ mandatory
 * review, 2026-09-26 six-tool pass) — removed outright rather than
 * softened, with the savings figure itself now carrying the "these two
 * numbers relate" information instead of a decorative glyph between them.
 */
export default async function InvoiceDiscountEarlyPaymentChart() {
  const t = await getTranslations("tools.batch-invoice-calculator.discountEarlyPaymentChart");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center rounded-xl border border-sky-300 bg-sky-50 px-4 py-5 dark:border-sky-500/40 dark:bg-sky-500/10">
          <span className="text-xs font-medium tracking-wide text-sky-600 uppercase dark:text-sky-300">{t("fullTerm")}</span>
          <span className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-200">${TOTAL.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-5 dark:border-emerald-500/40 dark:bg-emerald-500/10">
          <span className="text-xs font-medium tracking-wide text-emerald-600 uppercase dark:text-emerald-300">{t("earlyPayment", { percent: DISCOUNT_PERCENT })}</span>
          <span className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-200">${DISCOUNTED_TOTAL.toFixed(2)}</span>
        </div>
      </div>
      <p dir="ltr" className="mt-3 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        {t("savingsLabel")}: ${SAVINGS.toFixed(2)}
      </p>
    </SectionCard>
  );
}
