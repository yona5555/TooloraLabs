import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduLineChart from "./EduLineChart";

/** Real running-total example: four invoices in a batch, each with its own total, accumulating — a running total over the batch, best read as a trend line. */
const INVOICE_TOTALS = [1186.45, 842.1, 2415.6, 1655.9];

export default async function InvoiceBatchAccumulationChart() {
  const t = await getTranslations("tools.batch-invoice-calculator.batchAccumulationChart");

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
      <div className="mt-4">
        <EduLineChart points={points} ariaLabel={t("title")} lineColorClass="stroke-violet-500 dark:stroke-violet-400" dotColorClass="fill-violet-500 dark:fill-violet-400" />
      </div>
    </SectionCard>
  );
}
