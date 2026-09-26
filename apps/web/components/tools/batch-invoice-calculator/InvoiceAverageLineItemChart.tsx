import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "./EduBarChart";

/** Real batch of five line-item totals and their computed average. */
const LINE_TOTALS = [1020, 73.5, 450, 220, 610];
const AVERAGE = LINE_TOTALS.reduce((sum, v) => sum + v, 0) / LINE_TOTALS.length;

export default async function InvoiceAverageLineItemChart() {
  const t = await getTranslations("tools.batch-invoice-calculator.averageLineItemChart");
  const tRoot = await getTranslations("tools.batch-invoice-calculator");

  const bars = [
    ...LINE_TOTALS.map((v, i) => ({ label: t("itemN", { n: i + 1 }), value: v, formatted: `$${v.toFixed(2)}` })),
    { label: t("average"), value: AVERAGE, formatted: `$${AVERAGE.toFixed(2)}`, highlight: true },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <EduBarChart bars={bars} ariaLabel={t("title")} barColorClass="fill-amber-500/80 dark:fill-amber-400/80" />
        </div>
        <div dir="ltr" className="shrink-0 rounded-xl bg-zinc-50 p-4 lg:w-56 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{tRoot("workedExampleTitle")}</p>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-600 dark:text-zinc-300">{t("sumLabel")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">${LINE_TOTALS.reduce((s, v) => s + v, 0).toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-600 dark:text-zinc-300">{t("countLabel")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{LINE_TOTALS.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-2 dark:border-zinc-700">
              <dt className="font-semibold text-zinc-700 dark:text-zinc-200">{t("average")}</dt>
              <dd className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">${AVERAGE.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </SectionCard>
  );
}
