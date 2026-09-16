import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduLineChart from "./EduLineChart";

/** Real weekly-dining projection: the tool's own per-visit tip amount, multiplied across a year — a running total over time, best read as a trend line. */
const WEEKLY_TIP = 15.3;
const MONTH_MARKS = [3, 6, 9, 12];
const WEEKS_PER_MONTH = 4.33;

export default async function TipCumulativeAnnualDiagram() {
  const t = await getTranslations("tools.tip-calculator.cumulativeAnnualDiagram");

  const points = MONTH_MARKS.map((months) => {
    const total = WEEKLY_TIP * WEEKS_PER_MONTH * months;
    return { x: months, label: t("months", { count: months }), value: total, formatted: `$${Math.round(total).toLocaleString("en-US")}` };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { weeklyTip: WEEKLY_TIP.toFixed(2) })}</p>
      <div className="mt-4">
        <EduLineChart points={points} ariaLabel={t("title")} lineColorClass="stroke-violet-500 dark:stroke-violet-400" dotColorClass="fill-violet-500 dark:fill-violet-400" />
      </div>
    </SectionCard>
  );
}
