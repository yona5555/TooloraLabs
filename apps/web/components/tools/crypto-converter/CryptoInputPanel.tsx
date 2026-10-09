"use client";
import { useTranslations } from "next-intl";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import type { DigitStyle } from "@tooloralabs/core";
import { convertCryptoAmount, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import CryptoCoinPicker from "./CryptoCoinPicker";
import CryptoFiatPicker from "./CryptoFiatPicker";
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

const QUICK_AMOUNTS = [0.1, 1, 5, 10, 100, 1000];

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

        {fiatRates.length > 0 && <CryptoFiatPicker rates={fiatRates} value={fiatCode} onChange={onFiatChange} />}

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
        <div className="mt-5 flex flex-1 flex-col border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("quickTitle")}</h3>
          <div className="mt-2 flex-1 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="h-full w-full text-xs" data-testid="quick-table">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <tr>
                  <th dir="ltr" className="px-2 py-1.5 text-start font-medium uppercase">{fromCoin.symbol}</th>
                  <th dir="ltr" className="px-2 py-1.5 text-end font-medium uppercase">{toCoin.symbol}</th>
                  <th dir="ltr" className="px-2 py-1.5 text-end font-medium">{f.currency}</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_AMOUNTS.map((a) => (
                  <tr key={a} className="border-t border-zinc-100 even:bg-zinc-50/60 dark:border-zinc-800 dark:even:bg-zinc-800/30">
                    <td dir="ltr" className="px-2 py-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">{f.num(a, 2)}</td>
                    <td dir="ltr" className="px-2 py-1 text-end font-mono text-blue-700 dark:text-blue-300">{f.amount(convertCryptoAmount(a, fromPrice, toPrice))}</td>
                    <td dir="ltr" className="px-2 py-1 text-end font-mono text-zinc-700 dark:text-zinc-300">{f.compactMoney(a * fromPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
