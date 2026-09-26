import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "./EduBarChart";
import TipWorkedExampleNote from "./TipWorkedExampleNote";

/** Same $60 bill at four common tip percentages — small differences in the rate compound quickly as the bill grows. */
const BILL = 60;
const PERCENTS = [15, 18, 20, 25];

export default async function TipPercentBarDiagram() {
  const t = await getTranslations("tools.tip-calculator.education.intro.diagram");
  const tRoot = await getTranslations("tools.tip-calculator");

  const bars = PERCENTS.map((pct) => {
    const value = BILL * (pct / 100);
    return { label: `${pct}%`, value, formatted: `$${value.toFixed(2)}` };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <EduBarChart bars={bars} ariaLabel={t("title")} barColorClass="fill-blue-500/80 dark:fill-blue-400/80" />
        </div>
        <TipWorkedExampleNote
          title={tRoot("workedExampleTitle")}
          rows={bars.map((b) => ({ label: b.label, value: b.formatted }))}
        />
      </div>
    </SectionCard>
  );
}
