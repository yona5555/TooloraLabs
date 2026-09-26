import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "./EduBarChart";
import TipWorkedExampleNote from "./TipWorkedExampleNote";

/** Fixed 18% tip, four real bill sizes — the tool's own bill*tip% formula, directly. */
const TIP_PERCENT = 18;
const BILLS = [20, 50, 85, 150];

export default async function TipBillSizeScalingChart() {
  const t = await getTranslations("tools.tip-calculator.billSizeScalingChart");
  const tRoot = await getTranslations("tools.tip-calculator");

  const bars = BILLS.map((bill) => {
    const tip = bill * (TIP_PERCENT / 100);
    return { label: `$${bill}`, value: tip, formatted: `$${tip.toFixed(2)}` };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { percent: TIP_PERCENT })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <EduBarChart bars={bars} ariaLabel={t("title")} barColorClass="fill-amber-500/80 dark:fill-amber-400/80" />
        </div>
        <TipWorkedExampleNote title={tRoot("workedExampleTitle")} rows={bars.map((b) => ({ label: b.label, value: b.formatted }))} />
      </div>
    </SectionCard>
  );
}
