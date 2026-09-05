"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { FuelRateMode } from "./types";

type Props = {
  distance: string;
  onDistanceChange: (value: string) => void;
  rateMode: FuelRateMode;
  onRateModeChange: (value: FuelRateMode) => void;
  rateValue: string;
  onRateValueChange: (value: string) => void;
  pricePerUnit: string;
  onPricePerUnitChange: (value: string) => void;
};

export default function FuelInputPanel({
  distance,
  onDistanceChange,
  rateMode,
  onRateModeChange,
  rateValue,
  onRateValueChange,
  pricePerUnit,
  onPricePerUnitChange,
}: Props) {
  const t = useTranslations("tools.fuel-cost-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <ToolInput
          label={t("distanceLabel")}
          type="text"
          inputMode="decimal"
          value={distance}
          onChange={(e) => onDistanceChange(e.target.value)}
        />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("rateModeLabel")}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onRateModeChange("consumption")}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                rateMode === "consumption"
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t("rateModes.consumption")}
            </button>
            <button
              type="button"
              onClick={() => onRateModeChange("efficiency")}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                rateMode === "efficiency"
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t("rateModes.efficiency")}
            </button>
          </div>
        </div>

        <ToolInput
          label={rateMode === "consumption" ? t("rateValueLabelConsumption") : t("rateValueLabelEfficiency")}
          type="text"
          inputMode="decimal"
          value={rateValue}
          onChange={(e) => onRateValueChange(e.target.value)}
          hint={rateMode === "consumption" ? t("rateValueHintConsumption") : t("rateValueHintEfficiency")}
        />

        <ToolInput
          label={t("priceLabel")}
          type="text"
          inputMode="decimal"
          value={pricePerUnit}
          onChange={(e) => onPricePerUnitChange(e.target.value)}
          hint={t("priceHint")}
        />
      </div>
    </SectionCard>
  );
}
