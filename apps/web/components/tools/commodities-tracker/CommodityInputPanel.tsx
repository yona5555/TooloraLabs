"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { CommodityId, MetalWeightUnit } from "./types";

type CommodityInputPanelProps = {
  commodity: CommodityId;
  onCommodityChange: (commodity: CommodityId) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  weightUnit: MetalWeightUnit;
  onWeightUnitChange: (unit: MetalWeightUnit) => void;
};

const COMMODITIES: CommodityId[] = ["gold", "silver", "oil"];
const WEIGHT_UNITS: MetalWeightUnit[] = ["gram", "troyOunce"];

export default function CommodityInputPanel({
  commodity,
  onCommodityChange,
  amount,
  onAmountChange,
  weightUnit,
  onWeightUnitChange,
}: CommodityInputPanelProps) {
  const t = useTranslations("tools.commodities-tracker.aboveFold");
  const isMetal = commodity !== "oil";

  return (
    <SectionCard title={t("converterTitle")}>
      <div className="space-y-5">
        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("commodityLabel")}</span>
          <div className="grid grid-cols-3 gap-2">
            {COMMODITIES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onCommodityChange(id)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  commodity === id
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {t(`commodity.${id}`)}
              </button>
            ))}
          </div>
        </div>

        <ToolInput
          label={t(isMetal ? "amountLabelWeight" : "amountLabelBarrels")}
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />

        {isMetal && (
          <div>
            <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("weightUnitLabel")}</span>
            <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
              {WEIGHT_UNITS.map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onWeightUnitChange(unit)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    weightUnit === unit
                      ? "bg-blue-600 text-white"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {t(`weightUnit.${unit}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
