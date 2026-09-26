import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduDonutChart from "./EduDonutChart";

/** Real sample invoice's own two line items, each quantity * unit price, shown as a donut of their share of the invoice. */
const LINE_ITEMS = [
  { key: "consulting", qty: 12, price: 85, colorClass: "stroke-amber-500 dark:stroke-amber-400", dotColorClass: "bg-amber-500 dark:bg-amber-400" },
  { key: "supplies", qty: 3, price: 24.5, colorClass: "stroke-emerald-500 dark:stroke-emerald-400", dotColorClass: "bg-emerald-500 dark:bg-emerald-400" },
];

export default async function InvoiceLineItemBreakdownChart() {
  const t = await getTranslations("tools.batch-invoice-calculator.lineItemBreakdownChart");
  const tItems = await getTranslations("tools.batch-invoice-calculator.lineItemBreakdownChart.items");
  const tRoot = await getTranslations("tools.batch-invoice-calculator");

  const segments = LINE_ITEMS.map((item) => {
    const total = item.qty * item.price;
    return { key: item.key, label: tItems(item.key), value: total, formatted: `$${total.toFixed(2)}`, colorClass: item.colorClass, dotColorClass: item.dotColorClass };
  });
  const invoiceTotal = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduDonutChart segments={segments} ariaLabel={t("title")} />
        </div>
        <div dir="ltr" className="min-w-0 flex-1 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{tRoot("workedExampleTitle")}</p>
          <dl className="mt-2 space-y-2 text-sm">
            {segments.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-3">
                <dt className="text-zinc-600 dark:text-zinc-300">{s.label}</dt>
                <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{s.formatted}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-2 dark:border-zinc-700">
              <dt className="font-semibold text-zinc-700 dark:text-zinc-200">{t("invoiceTotalLabel")}</dt>
              <dd className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">${invoiceTotal.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </SectionCard>
  );
}
