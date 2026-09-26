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
  const tRoot = await getTranslations("tools.batch-invoice-calculator");

  const segments = VENDORS.map((v) => ({ key: v.key, label: tVendors(v.key), value: v.total, formatted: `$${v.total.toFixed(2)}`, colorClass: v.colorClass, dotColorClass: v.dotColorClass }));
  const batchTotal = segments.reduce((sum, s) => sum + s.value, 0);

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
                <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                  {s.formatted} <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">({Math.round((s.value / batchTotal) * 100)}%)</span>
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-2 dark:border-zinc-700">
              <dt className="font-semibold text-zinc-700 dark:text-zinc-200">{t("batchTotalLabel")}</dt>
              <dd className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">${batchTotal.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </SectionCard>
  );
}
