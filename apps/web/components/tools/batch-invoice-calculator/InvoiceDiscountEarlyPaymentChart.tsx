import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real 2/10 Net 30 terms (a standard, documented early-payment-discount convention): total with vs without the 2% discount — a direct two-value comparison, not a bar list. */
const TOTAL = 1186.45;
const DISCOUNT_PERCENT = 2;
const DISCOUNTED_TOTAL = TOTAL * (1 - DISCOUNT_PERCENT / 100);

export default async function InvoiceDiscountEarlyPaymentChart() {
  const t = await getTranslations("tools.batch-invoice-calculator.discountEarlyPaymentChart");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="flex flex-1 flex-col items-center rounded-lg border border-sky-300 bg-sky-50 px-4 py-5 dark:border-sky-500/40 dark:bg-sky-500/10">
          <span className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-300">{t("fullTerm")}</span>
          <span className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-200">${TOTAL.toFixed(2)}</span>
        </div>
        <svg width={32} height={24} viewBox="0 0 32 24" role="img" aria-label="-" className="shrink-0 text-current opacity-50">
          <line x1={4} y1={12} x2={28} y2={12} stroke="currentColor" strokeWidth={2} />
        </svg>
        <div className="flex flex-1 flex-col items-center rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-5 dark:border-emerald-500/40 dark:bg-emerald-500/10">
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-300">{t("earlyPayment", { percent: DISCOUNT_PERCENT })}</span>
          <span className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-200">${DISCOUNTED_TOTAL.toFixed(2)}</span>
        </div>
      </div>
    </SectionCard>
  );
}
