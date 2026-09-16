import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real, direct look at the tool's own dollar impact: bill alone vs bill + tip — a two-value side-by-side comparison, not a bar list. */
const BILL = 85;
const TIP_PERCENT = 18;
const TOTAL = BILL * (1 + TIP_PERCENT / 100);

export default async function TipVsNoTipComparisonChart() {
  const t = await getTranslations("tools.tip-calculator.vsNoTipComparisonChart");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="flex flex-1 flex-col items-center rounded-lg border border-sky-300 bg-sky-50 px-4 py-5 dark:border-sky-500/40 dark:bg-sky-500/10">
          <span className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-300">{t("billOnly")}</span>
          <span className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-200">${BILL.toFixed(2)}</span>
        </div>
        <svg width={32} height={24} viewBox="0 0 32 24" role="img" aria-label="+" className="shrink-0 text-current opacity-50">
          <line x1={16} y1={4} x2={16} y2={20} stroke="currentColor" strokeWidth={2} />
          <line x1={4} y1={12} x2={28} y2={12} stroke="currentColor" strokeWidth={2} />
        </svg>
        <div className="flex flex-1 flex-col items-center rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-5 dark:border-indigo-500/40 dark:bg-indigo-500/10">
          <span className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{t("withTip", { percent: TIP_PERCENT })}</span>
          <span className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-200">${TOTAL.toFixed(2)}</span>
        </div>
      </div>
    </SectionCard>
  );
}
