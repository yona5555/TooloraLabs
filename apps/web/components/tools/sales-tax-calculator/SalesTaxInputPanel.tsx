"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";
import type { SalesTaxMode } from "./types";

type SalesTaxInputPanelProps = {
  mode: SalesTaxMode;
  onModeChange: (mode: SalesTaxMode) => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  price: string;
  onPriceChange: (value: string) => void;
  taxRate: string;
  onTaxRateChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function SalesTaxInputPanel({
  mode,
  onModeChange,
  currency,
  onCurrencyChange,
  price,
  onPriceChange,
  taxRate,
  onTaxRateChange,
  onCalculate,
  onClear,
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

      <form onSubmit={onCalculate} className="mt-5 space-y-5">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />

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

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
