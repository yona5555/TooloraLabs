import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import FuelFlowDiagram from "./FuelFlowDiagram";
import type { FuelCostCalculatorOutput } from "./types";

type Props = {
  result: FuelCostCalculatorOutput;
  distance: number;
  digitStyle: DigitStyle;
};

export default function FuelResult({ result, distance, digitStyle }: Props) {
  const t = useTranslations("tools.fuel-cost-calculator.result");
  const fmt = (value: number, maxFractionDigits = 2) =>
    formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: maxFractionDigits });

  if (result.error) {
    const messageKey =
      result.error === "invalid-distance"
        ? "invalidDistance"
        : result.error === "invalid-rate"
          ? "invalidRate"
          : "invalidPrice";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={fmt(result.totalCost)} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center font-mono text-3xl font-bold text-blue-700 dark:text-blue-300">
          {fmt(result.totalCost)}
        </p>

        <div dir="ltr" className="mt-5 flex justify-center overflow-x-auto">
          <FuelFlowDiagram
            distanceLabel={fmt(distance, 0)}
            fuelLabel={fmt(result.fuelUsed)}
            costLabel={fmt(result.totalCost)}
          />
        </div>

        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("fuelUsedLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.fuelUsed)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("costPerDistanceLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
              {fmt(result.costPerDistanceUnit, 3)}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
