"use client";
import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowUpDown, RotateCcw } from "lucide-react";
import type { CurrencyRate } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ForexCurrencyPicker from "./ForexCurrencyPicker";

type ForexInputPanelProps = {
  currencies: CurrencyRate[];
  dataUnavailable: boolean;
  amount: string;
  onAmountChange: (value: string) => void;
  fromCode: string;
  onFromChange: (code: string) => void;
  toCode: string;
  onToChange: (code: string) => void;
  onSwap: () => void;
  onClear: () => void;
};

export default function ForexInputPanel({
  currencies,
  dataUnavailable,
  amount,
  onAmountChange,
  fromCode,
  onFromChange,
  toCode,
  onToChange,
  onSwap,
  onClear,
}: ForexInputPanelProps) {
  const t = useTranslations("tools.forex-converter.aboveFold");

  return (
    <SectionCard title={t("converterTitle")}>
      <div className="space-y-5">
        {dataUnavailable && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>{t("dataUnavailable")}</p>
          </div>
        )}
        <ToolInput
          label={t("amountLabel")}
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />

        <ForexCurrencyPicker label={t("fromLabel")} currencies={currencies} value={fromCode} onChange={onFromChange} />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onSwap}
            aria-label={t("swapLabel")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            <ArrowUpDown size={18} />
          </button>
        </div>

        <ForexCurrencyPicker label={t("toLabel")} currencies={currencies} value={toCode} onChange={onToChange} />

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={16} />
          {t("clear")}
        </button>
      </div>
    </SectionCard>
  );
}
