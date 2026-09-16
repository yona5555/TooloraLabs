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

  const segments = LINE_ITEMS.map((item) => {
    const total = item.qty * item.price;
    return { key: item.key, label: tItems(item.key), value: total, formatted: `$${total.toFixed(2)}`, colorClass: item.colorClass, dotColorClass: item.dotColorClass };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div className="mt-4">
        <EduDonutChart segments={segments} ariaLabel={t("title")} />
      </div>
    </SectionCard>
  );
}
