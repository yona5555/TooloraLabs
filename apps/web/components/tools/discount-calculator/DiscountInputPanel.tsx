"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";
import type { DiscountMode } from "./types";

const MAX_STAGES = 3;

type DiscountInputPanelProps = {
  mode: DiscountMode;
  onModeChange: (mode: DiscountMode) => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  price: string;
  onPriceChange: (value: string) => void;
  discounts: string[];
  onDiscountsChange: (discounts: string[]) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function DiscountInputPanel({
  mode,
  onModeChange,
  currency,
  onCurrencyChange,
  price,
  onPriceChange,
  discounts,
  onDiscountsChange,
  onCalculate,
  onClear,
}: DiscountInputPanelProps) {
  const t = useTranslations("tools.discount-calculator.form");

  function updateDiscount(index: number, value: string) {
    const next = [...discounts];
    next[index] = value;
    onDiscountsChange(next);
  }

  function addStage() {
    if (discounts.length >= MAX_STAGES) return;
    onDiscountsChange([...discounts, ""]);
  }

  function removeStage(index: number) {
    onDiscountsChange(discounts.filter((_, i) => i !== index));
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        {(["apply", "reverse"] as const).map((m) => (
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
            {m === "apply" ? t("modeApply") : t("modeReverse")}
          </button>
        ))}
      </div>

      <form onSubmit={onCalculate} className="mt-5 space-y-5">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />

        <ToolInput
          label={mode === "apply" ? t("priceLabel") : t("finalPriceLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("pricePlaceholder")}
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
        />

        <div className="space-y-3">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {mode === "apply" ? t("discountsLabel") : t("discountLabel")}
          </span>

          {discounts.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <ToolInput
                type="text"
                inputMode="decimal"
                placeholder={t("discountPlaceholder", { stage: index + 1 })}
                value={value}
                onChange={(e) => updateDiscount(index, e.target.value)}
                className="flex-1"
              />
              {mode === "apply" && discounts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStage(index)}
                  aria-label={t("removeStage")}
                  className="shrink-0 rounded-lg border border-zinc-200 p-3 text-zinc-400 transition hover:border-red-300 hover:text-red-500 dark:border-zinc-700 dark:hover:border-red-500/40"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}

          {mode === "apply" && discounts.length < MAX_STAGES && (
            <button
              type="button"
              onClick={addStage}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-400 dark:hover:bg-blue-500/10"
            >
              <Plus size={16} />
              {t("addStage")}
            </button>
          )}
        </div>

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
