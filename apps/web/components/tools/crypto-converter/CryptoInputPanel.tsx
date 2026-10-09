"use client";
import { useTranslations } from "next-intl";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import type { DigitStyle } from "@tooloralabs/core";
import { convertCryptoAmount, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import CryptoCoinPicker from "./CryptoCoinPicker";
import FiatPicker from "@/components/tools/markets/FiatPicker";
import QuickConversionTable, { quickAmounts } from "@/components/tools/markets/QuickConversionTable";
import { useCryptoFormatters } from "./cryptoFormat";
import type { FiatRate } from "./types";

type CryptoInputPanelProps = {
  coins: CryptoCoin[];
  amount: string;
  onAmountChange: (value: string) => void;
  fromCoinId: string;
  onFromCoinChange: (id: string) => void;
  toCoinId: string;
  onToCoinChange: (id: string) => void;
  onCoinDiscovered: (coin: CryptoCoin) => void;
  onSwap: () => void;
  onClear: () => void;
  fiatRates: FiatRate[];
  fiatCode: string;
  onFiatChange: (code: string) => void;
  /** Live (or snapshot) USD prices of the pair, shared with the Live Conversion Flow. */
  fromPrice: number | null;
  toPrice: number | null;
  fromCoin: CryptoCoin | undefined;
  toCoin: CryptoCoin | undefined;
  digitStyle: DigitStyle;
};

const QUICK_AMOUNTS = quickAmounts(-4, 6);

export default function CryptoInputPanel({
  coins,
  amount,
  onAmountChange,
  fromCoinId,
  onFromCoinChange,
  toCoinId,
  onToCoinChange,
  onCoinDiscovered,
  onSwap,
  onClear,
  fiatRates,
  fiatCode,
  onFiatChange,
  fromPrice,
  toPrice,
  fromCoin,
  toCoin,
  digitStyle,
}: CryptoInputPanelProps) {
  const t = useTranslations("tools.crypto-converter.aboveFold");
  const f = useCryptoFormatters(digitStyle);
  const quick = fromCoin && toCoin && fromPrice && toPrice;

  return (
    <SectionCard title={t("converterTitle")} className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col p-4 lg:p-6">
      <div className="space-y-5">
        <ToolInput
          label={t("amountLabel")}
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />

        <CryptoCoinPicker
          label={t("fromLabel")}
          coins={coins}
          value={fromCoinId}
          onChange={onFromCoinChange}
          onCoinDiscovered={onCoinDiscovered}
        />

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

        <CryptoCoinPicker
          label={t("toLabel")}
          coins={coins}
          value={toCoinId}
          onChange={onToCoinChange}
          onCoinDiscovered={onCoinDiscovered}
        />

        {fiatRates.length > 0 && (
          <FiatPicker
            rates={fiatRates}
            value={fiatCode}
            onChange={onFiatChange}
            label={t("fiatLabel")}
            searchPlaceholder={t("fiatSearchPlaceholder")}
            noResults={t("fiatNoResults")}
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

      {/* Quick conversions: common amounts of the source coin, in the target coin and the display currency. */}
      {quick && (
        <QuickConversionTable
          title={t("quickTitle")}
          columns={[fromCoin.symbol, toCoin.symbol, f.currency]}
          rows={QUICK_AMOUNTS.map((a) => [f.num(a, 3), f.amount(convertCryptoAmount(a, fromPrice, toPrice)), f.compactMoney(a * fromPrice)])}
        />
      )}
    </SectionCard>
  );
}
