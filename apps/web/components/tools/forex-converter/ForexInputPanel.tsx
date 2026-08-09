"use client";
import { useTranslations } from "next-intl";
import { ArrowUpDown } from "lucide-react";
import type { CurrencyRate } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ForexCurrencyPicker from "./ForexCurrencyPicker";

type ForexInputPanelProps = {
  currencies: CurrencyRate[];
  amount: string;
  onAmountChange: (value: string) => void;
  fromCode: string;
  onFromChange: (code: string) => void;
  toCode: string;
  onToChange: (code: string) => void;
  onSwap: () => void;
};

export default function ForexInputPanel({
  currencies,
  amount,
  onAmountChange,
  fromCode,
  onFromChange,
  toCode,
  onToChange,
  onSwap,
}: ForexInputPanelProps) {
  const t = useTranslations("tools.forex-converter.aboveFold");

  return (
    <SectionCard title={t("converterTitle")}>
      <div className="space-y-5">
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
      </div>
    </SectionCard>
  );
}
