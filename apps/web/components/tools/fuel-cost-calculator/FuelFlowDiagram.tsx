"use client";
import { useTranslations } from "next-intl";
import { Route, Fuel as FuelIcon, Wallet, ChevronRight, type LucideIcon } from "lucide-react";

type Props = {
  distanceLabel: string;
  fuelLabel: string;
  costLabel: string;
};

type BoxTone = {
  bgClass: string;
  iconClass: string;
  valueClass: string;
};

const DISTANCE_TONE: BoxTone = {
  bgClass: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/15 dark:to-blue-500/5",
  iconClass: "text-blue-600 dark:text-blue-300",
  valueClass: "text-blue-700 dark:text-blue-200",
};
const FUEL_TONE: BoxTone = {
  bgClass: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-500/15 dark:to-indigo-500/5",
  iconClass: "text-indigo-600 dark:text-indigo-300",
  valueClass: "text-indigo-700 dark:text-indigo-200",
};
const COST_TONE: BoxTone = {
  bgClass: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/15 dark:to-purple-500/5",
  iconClass: "text-purple-600 dark:text-purple-300",
  valueClass: "text-purple-700 dark:text-purple-200",
};

function FlowBox({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: BoxTone }) {
  return (
    <div className={`flex min-w-[92px] flex-1 flex-col items-center gap-1.5 rounded-2xl px-3 py-4 text-center ${tone.bgClass}`}>
      <Icon size={18} className={tone.iconClass} aria-hidden="true" />
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      <span dir="ltr" className={`font-mono text-2xl font-bold ${tone.valueClass}`}>
        {value}
      </span>
    </div>
  );
}

/** Gradient shaft connecting the previous box's tone to the next box's tone, with a chevron that flips (rtl:rotate-180) so it always points toward the next box regardless of reading direction. The gradient direction itself also flips (rtl:bg-gradient-to-l) so its color ramp still runs from the previous box to the next one visually, not just in DOM order. */
function FlowArrow({ barClass, chevronClass }: { barClass: string; chevronClass: string }) {
  return (
    <div className="flex w-6 shrink-0 items-center justify-center gap-0.5 sm:w-8">
      <span className={`h-0.5 flex-1 rounded-full bg-gradient-to-r rtl:bg-gradient-to-l ${barClass}`} />
      <ChevronRight size={14} className={`shrink-0 rtl:rotate-180 ${chevronClass}`} aria-hidden="true" />
    </div>
  );
}

export default function FuelFlowDiagram({ distanceLabel, fuelLabel, costLabel }: Props) {
  const t = useTranslations("tools.fuel-cost-calculator.diagram");

  return (
    <div role="img" aria-label={t("ariaLabel")} className="flex w-full max-w-full items-center">
      <FlowBox icon={Route} label={t("distance")} value={distanceLabel} tone={DISTANCE_TONE} />
      <FlowArrow barClass="from-blue-400 to-indigo-400 dark:from-blue-500 dark:to-indigo-500" chevronClass="text-indigo-400 dark:text-indigo-300" />
      <FlowBox icon={FuelIcon} label={t("fuelUsed")} value={fuelLabel} tone={FUEL_TONE} />
      <FlowArrow barClass="from-indigo-400 to-purple-400 dark:from-indigo-500 dark:to-purple-500" chevronClass="text-purple-400 dark:text-purple-300" />
      <FlowBox icon={Wallet} label={t("totalCost")} value={costLabel} tone={COST_TONE} />
    </div>
  );
}
