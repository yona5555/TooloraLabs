import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduDonutChart from "./EduDonutChart";

/** Real two-vendor batch example: each vendor's own invoice total, shown as a donut of the batch's total spend. */
const VENDORS = [
  { key: "acme", total: 1186.45, colorClass: "stroke-rose-500 dark:stroke-rose-400", dotColorClass: "bg-rose-500 dark:bg-rose-400" },
  { key: "globex", total: 842.1, colorClass: "stroke-sky-500 dark:stroke-sky-400", dotColorClass: "bg-sky-500 dark:bg-sky-400" },
];

export default async function InvoiceVendorSplitChart() {
  const t = await getTranslations("tools.batch-invoice-calculator.vendorSplitChart");
  const tVendors = await getTranslations("tools.batch-invoice-calculator.vendorSplitChart.vendors");

  const segments = VENDORS.map((v) => ({ key: v.key, label: tVendors(v.key), value: v.total, formatted: `$${v.total.toFixed(2)}`, colorClass: v.colorClass, dotColorClass: v.dotColorClass }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div className="mt-4">
        <EduDonutChart segments={segments} ariaLabel={t("title")} />
      </div>
    </SectionCard>
  );
}
