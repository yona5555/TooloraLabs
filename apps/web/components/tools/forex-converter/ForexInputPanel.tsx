"use client";
import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowUpDown, RotateCcw } from "lucide-react";
import type { DigitStyle } from "@tooloralabs/core";
import { convertCurrencyAmount, type CurrencyRate } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import FiatPicker from "@/components/tools/markets/FiatPicker";
import QuickConversionTable, { quickAmounts } from "@/components/tools/markets/QuickConversionTable";
import { useMarketFormatters, type FiatRate } from "@/components/tools/markets/fiat";
import ForexCurrencyPicker from "./ForexCurrencyPicker";

const QUICK_AMOUNTS = quickAmounts(0, 9);

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
  fromCurrency: CurrencyRate | undefined;
  toCurrency: CurrencyRate | undefined;
  fiatRates: FiatRate[];
  fiatCode: string;
  onFiatChange: (code: string) => void;
  digitStyle: DigitStyle;
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
  fromCurrency,
  toCurrency,
  fiatRates,
  fiatCode,
  onFiatChange,
  digitStyle,
}: ForexInputPanelProps) {
  const t = useTranslations("tools.forex-converter.aboveFold");
  const f = useMarketFormatters(digitStyle);

  return (
    <SectionCard title={t("converterTitle")} className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col p-4 lg:p-6">
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

        {fiatRates.length > 0 && (
          <FiatPicker
            rates={fiatRates}
            value={fiatCode}
            onChange={onFiatChange}
            label={t("fiatLabel")}
            searchPlaceholder={t("pickerSearchPlaceholder")}
            noResults={t("pickerNoResults")}
          />
        )}

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={16} />
          {t("clear")}
        </button>
      </div>

      {fromCurrency && toCurrency && (
        <QuickConversionTable
          title={t("quickTitle")}
          columns={[fromCurrency.code, toCurrency.code, f.currency]}
          rows={QUICK_AMOUNTS.map((a) => [
            f.num(a, 0),
            f.num(convertCurrencyAmount(a, fromCurrency.ratePerUsd, toCurrency.ratePerUsd), 4),
            f.compactMoney(a / fromCurrency.ratePerUsd),
          ])}
        />
      )}
    </SectionCard>
  );
}
