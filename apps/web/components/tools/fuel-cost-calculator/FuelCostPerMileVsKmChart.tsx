"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { Milestone, Ruler, Equal } from "lucide-react";
import { convertAmount } from "@/lib/currency";
import AutoFitText from "@/components/tool-ui/AutoFitText";
import { useFuelLiveInputs } from "./FuelLiveInputsContext";
import SectionCard from "@/components/tool-ui/SectionCard";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";
import { ltrIsolate } from "@/lib/bidi";

/** Same trip's cost-per-distance figure (the tool's own output field), expressed per mile vs per km via the real 1 mi = 1.60934 km conversion — a direct side-by-side comparison, not a multi-row bar list, since there are only two real values. */
const DISTANCE = 300;
const EFFICIENCY = 30;
const PRICE = 3.5;
const TOTAL_COST = (DISTANCE / EFFICIENCY) * PRICE;
const COST_PER_MILE = TOTAL_COST / DISTANCE;
const COST_PER_KM = COST_PER_MILE / 1.60934;

export default function FuelCostPerMileVsKmChart() {
  const t = useTranslations("tools.fuel-cost-calculator.costPerMileVsKmChart");
  const tf = useTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const td = useTranslations("tools.fuel-cost-calculator.diagram");
  const tw = useTranslations("tools.fuel-cost-calculator.workedExample");
  const live = useFuelLiveInputs();
  const currency = live?.currency ?? "USD";
  const digitStyle = live?.digitStyle ?? "western";
  const money = (usd: number) => formatLocalizedNumber(convertAmount(usd, "USD", currency), digitStyle, { style: "currency", currency, maximumFractionDigits: 2 });
  const perMileValue = money(COST_PER_MILE);
  const perKmValue = money(COST_PER_KM);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { cost: money(TOTAL_COST), distance: DISTANCE })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* §31 Type #11 (Side-by-Side Equivalence), upgraded execution:
            gradient cards + icon, not plain bordered boxes with a bare "="
            line-icon between them. Still stacks vertically below `sm:`
            (640px), row layout above it — at narrow viewports (confirmed via
            direct DOM measurement at 375px: available row width 275px vs.
            328px needed for two 128px boxes + arrow + gaps) two fixed-width
            boxes side by side genuinely don't fit, and neither box can
            shrink past its own uppercase tracking-wide label's min-content
            width. Matches the same stack-then-row pattern already used by
            EduDonutChart.tsx on this same page. */}
        <div dir="ltr" className="flex shrink-0 flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          {/* Fixed width (not auto/content-sized) so AutoFitText has a real,
              bounded target to measure and shrink against — an auto-width
              box just grows with its content and never triggers a shrink. */}
          <div className="flex w-32 flex-col items-center gap-1 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 px-4 py-5 text-center shadow-sm dark:from-sky-600 dark:to-sky-900">
            <Milestone size={20} className="text-sky-100" aria-hidden="true" />
            <span className="text-xs font-medium text-sky-100">{t("perMile")}</span>
            <AutoFitText text={perMileValue} allowWrap={false} className="font-mono font-bold text-white" />
          </div>
          <Equal size={18} className="shrink-0 text-current opacity-50" aria-hidden="true" />
          <div className="flex w-32 flex-col items-center gap-1 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 px-4 py-5 text-center shadow-sm dark:from-indigo-600 dark:to-indigo-900">
            <Ruler size={20} className="text-indigo-100" aria-hidden="true" />
            <span className="text-xs font-medium text-indigo-100">{t("perKm")}</span>
            <AutoFitText text={perKmValue} allowWrap={false} className="font-mono font-bold text-white" />
          </div>
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tf("distance"), value: `${DISTANCE} mi` },
            { label: td("totalCost"), value: money(TOTAL_COST) },
            {
              label: t("perMile"),
              value: money(COST_PER_MILE),
              emphasize: true,
              note: tw("comparisonTimes", { multiple: ltrIsolate((COST_PER_MILE / COST_PER_KM).toFixed(2)), label: `${t("perKm")} (${ltrIsolate(money(COST_PER_KM))})` }),
            },
            { label: t("perKm"), value: money(COST_PER_KM) },
            { label: t("per100kmLabel"), value: money(COST_PER_KM * 100) },
          ]}
        />
      </div>
      <p className="mt-3 text-center text-xs opacity-60">1 mi = 1.60934 km</p>
    </SectionCard>
  );
}
