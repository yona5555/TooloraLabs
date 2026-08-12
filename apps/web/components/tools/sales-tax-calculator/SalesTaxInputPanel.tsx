"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { SalesTaxMode } from "./types";

type SalesTaxInputPanelProps = {
  mode: SalesTaxMode;
  onModeChange: (mode: SalesTaxMode) => void;
  price: string;
  onPriceChange: (value: string) => void;
  taxRate: string;
  onTaxRateChange: (value: string) => void;
};

export default function SalesTaxInputPanel({
  mode,
  onModeChange,
  price,
  onPriceChange,
  taxRate,
  onTaxRateChange,
}: SalesTaxInputPanelProps) {
  const t = useTranslations("tools.sales-tax-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        {(["add", "reverse"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={`rounded-md px-3 py-3 text-sm font-medium transition ${
              mode === m
                ? "bg-blue-600 text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {m === "add" ? t("modeAdd") : t("modeReverse")}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        <ToolInput
          label={mode === "add" ? t("priceLabel") : t("totalPriceLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("pricePlaceholder")}
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
        />

        <ToolInput
          label={t("taxRateLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("taxRatePlaceholder")}
          value={taxRate}
          onChange={(e) => onTaxRateChange(e.target.value)}
        />
      </div>
    </SectionCard>
  );
}
