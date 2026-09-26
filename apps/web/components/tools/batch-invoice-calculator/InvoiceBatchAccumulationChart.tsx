import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduLineChart from "./EduLineChart";

/** Real running-total example: four invoices in a batch, each with its own total, accumulating — a running total over the batch, best read as a trend line. */
const INVOICE_TOTALS = [1186.45, 842.1, 2415.6, 1655.9];

export default async function InvoiceBatchAccumulationChart() {
  const t = await getTranslations("tools.batch-invoice-calculator.batchAccumulationChart");
  const tRoot = await getTranslations("tools.batch-invoice-calculator");

  const cumulativeTotals = INVOICE_TOTALS.reduce<number[]>((acc, total) => {
    const previous = acc.length > 0 ? acc[acc.length - 1] : 0;
    return [...acc, previous + total];
  }, []);
  const points = cumulativeTotals.map((running, i) => ({
    x: i + 1,
    label: t("invoiceN", { n: i + 1 }),
    value: running,
    formatted: `$${running.toFixed(2)}`,
  }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <EduLineChart points={points} ariaLabel={t("title")} lineColorClass="stroke-violet-500 dark:stroke-violet-400" dotColorClass="fill-violet-500 dark:fill-violet-400" />
        </div>
        <div dir="ltr" className="shrink-0 rounded-xl bg-zinc-50 p-4 lg:w-64 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{tRoot("workedExampleTitle")}</p>
          <dl className="mt-2 space-y-2 text-sm">
            {points.map((p, i) => (
              <div key={p.x} className={`flex items-center justify-between gap-3 ${i === points.length - 1 ? "border-t border-zinc-200 pt-2 dark:border-zinc-700" : ""}`}>
                <dt className={i === points.length - 1 ? "font-semibold text-zinc-700 dark:text-zinc-200" : "text-zinc-600 dark:text-zinc-300"}>{p.label}</dt>
                <dd className={`font-mono font-semibold ${i === points.length - 1 ? "text-lg font-bold text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}>{p.formatted}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </SectionCard>
  );
}
