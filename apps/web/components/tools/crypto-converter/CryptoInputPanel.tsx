"use client";
import { useTranslations } from "next-intl";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import type { CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import CryptoCoinPicker from "./CryptoCoinPicker";

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
};

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
}: CryptoInputPanelProps) {
  const t = useTranslations("tools.crypto-converter.aboveFold");

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
