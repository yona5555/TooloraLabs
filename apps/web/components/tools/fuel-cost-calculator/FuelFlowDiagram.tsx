"use client";
import { useTranslations } from "next-intl";
import { Route, Fuel as FuelIcon, Wallet, ChevronDown, type LucideIcon } from "lucide-react";
import AutoFitText from "@/components/tool-ui/AutoFitText";

type Props = {
  distanceLabel: string;
  fuelLabel: string;
  costLabel: string;
};

// Never a fixed pixel width, never wrapped — these boxes get real,
// generous space, tuned to still read as one line down to a small but
// legible size even for a long currency code + a 7-figure grouped total.
const RESULT_STEPS = ["text-3xl", "text-2xl", "text-xl", "text-lg", "text-base", "text-sm"];
const INPUT_STEPS = ["text-xl", "text-lg", "text-base", "text-sm"];

/**
 * Two compact "input" boxes (Distance, Fuel Used) side by side, feeding a
 * single large "result" card (Total Cost) below — replaces an earlier
 * design of three equal, near-square boxes squeezed into one horizontal
 * row. That row gave every value the same ~⅓ of the card's width no matter
 * how long it was, which a currency code + a large grouped total routinely
 * exceeded; two fix attempts on the *box* (shrink harder, then wrap) never
 * addressed that the *layout* itself under-budgeted space for the one
 * value (the cost) that's actually unbounded. The result card now gets the
 * card's full width — the same order-of-magnitude space as the
 * price-sensitivity chart next to it — and wrapping is switched off
 * entirely (see AutoFitText's `allowWrap`): a number is only ever shrunk,
 * never split across lines, since a split number is less readable than a
 * tight one.
 */
function InputBox({ icon: Icon, label, value, iconClass }: { icon: LucideIcon; label: string; value: string; iconClass: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl bg-zinc-50 px-3 py-3 text-center dark:bg-zinc-800/60">
      <Icon size={16} className={iconClass} aria-hidden="true" />
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      <AutoFitText dir="ltr" text={value} steps={INPUT_STEPS} allowWrap={false} className="font-mono font-bold text-zinc-800 dark:text-zinc-100" />
    </div>
  );
}

export default function FuelFlowDiagram({ distanceLabel, fuelLabel, costLabel }: Props) {
  const t = useTranslations("tools.fuel-cost-calculator.diagram");

  return (
    <div role="img" aria-label={t("ariaLabel")} className="flex w-full max-w-full flex-col items-stretch gap-2">
      <div className="flex items-stretch gap-2">
        <InputBox icon={Route} label={t("distance")} value={distanceLabel} iconClass="text-blue-500 dark:text-blue-300" />
        <InputBox icon={FuelIcon} label={t("fuelUsed")} value={fuelLabel} iconClass="text-indigo-500 dark:text-indigo-300" />
      </div>

      <ChevronDown size={16} className="mx-auto shrink-0 text-purple-400 dark:text-purple-300" aria-hidden="true" />

      <div className="flex min-w-0 flex-col items-center gap-1 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-4 text-center dark:from-purple-500/15 dark:to-purple-500/5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-300">
          <Wallet size={14} aria-hidden="true" />
          {t("totalCost")}
        </div>
        <AutoFitText dir="ltr" text={costLabel} steps={RESULT_STEPS} allowWrap={false} className="font-mono font-bold text-purple-700 dark:text-purple-200" />
      </div>
    </div>
  );
}
