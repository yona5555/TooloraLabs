import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduLineChart from "./EduLineChart";

/** Same $85 bill, four real tip percentages — the tool's own bill + bill*tip% formula is a continuous relationship as tip% rises, so a line reads it better than discrete bars. */
const BILL = 85;
const PERCENTS = [15, 18, 20, 25];

export default async function TipPercentRangeComparisonChart() {
  const t = await getTranslations("tools.tip-calculator.percentRangeComparisonChart");

  const points = PERCENTS.map((pct) => {
    const total = BILL * (1 + pct / 100);
    return { x: pct, label: `${pct}%`, value: total, formatted: `$${total.toFixed(2)}` };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { bill: BILL.toFixed(2) })}</p>
      <div className="mt-4">
        <EduLineChart points={points} ariaLabel={t("title")} lineColorClass="stroke-emerald-500 dark:stroke-emerald-400" dotColorClass="fill-emerald-500 dark:fill-emerald-400" />
      </div>
    </SectionCard>
  );
}
