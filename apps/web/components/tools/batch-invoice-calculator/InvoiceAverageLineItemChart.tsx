import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "./EduBarChart";

/** Real batch of five line-item totals and their computed average. */
const LINE_TOTALS = [1020, 73.5, 450, 220, 610];
const AVERAGE = LINE_TOTALS.reduce((sum, v) => sum + v, 0) / LINE_TOTALS.length;

export default async function InvoiceAverageLineItemChart() {
  const t = await getTranslations("tools.batch-invoice-calculator.averageLineItemChart");

  const bars = [
    ...LINE_TOTALS.map((v, i) => ({ label: t("itemN", { n: i + 1 }), value: v, formatted: `$${v.toFixed(2)}` })),
    { label: t("average"), value: AVERAGE, formatted: `$${AVERAGE.toFixed(2)}`, highlight: true },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div className="mt-4">
        <EduBarChart bars={bars} ariaLabel={t("title")} barColorClass="fill-amber-500/80 dark:fill-amber-400/80" />
      </div>
    </SectionCard>
  );
}
