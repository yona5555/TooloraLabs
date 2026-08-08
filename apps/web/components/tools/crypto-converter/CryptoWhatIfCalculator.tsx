"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateInvestmentReturn, MAX_HISTORY_DAYS, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import CryptoCoinPicker from "./CryptoCoinPicker";

type CryptoWhatIfCalculatorProps = {
  coins: CryptoCoin[];
  onCoinDiscovered: (coin: CryptoCoin) => void;
  digitStyle: DigitStyle;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function minIsoDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - MAX_HISTORY_DAYS);
  return d.toISOString().slice(0, 10);
}

export default function CryptoWhatIfCalculator({ coins, onCoinDiscovered, digitStyle }: CryptoWhatIfCalculatorProps) {
  const t = useTranslations("tools.crypto-converter.whatIf");
  const [coinId, setCoinId] = useState("bitcoin");
  const [amount, setAmount] = useState("1000");
  const [date, setDate] = useState(minIsoDate());
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [priceThen, setPriceThen] = useState<number | null>(null);

  const min = useMemo(() => minIsoDate(), []);
  const max = useMemo(() => todayIsoDate(), []);
  const selectedCoin = coins.find((coin) => coin.id === coinId);

  async function handleCalculate() {
    setStatus("loading");
    setPriceThen(null);
    try {
      const res = await fetch(`/api/crypto/history?coin=${encodeURIComponent(coinId)}&date=${date}`);
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const json = (await res.json()) as { priceUsd: number };
      setPriceThen(json.priceUsd);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const amountValue = parseLocalizedNumber(amount);
  const result =
    status === "success" && priceThen !== null && selectedCoin
      ? calculateInvestmentReturn(amountValue, priceThen, selectedCoin.currentPrice)
      : null;

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <CryptoCoinPicker label={t("coinLabel")} coins={coins} value={coinId} onChange={setCoinId} onCoinDiscovered={onCoinDiscovered} />
        </div>
        <ToolInput
          label={t("amountLabel")}
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <ToolInput
          label={t("dateLabel")}
          type="date"
          value={date}
          min={min}
          max={max}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={status === "loading"}
        className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {status === "loading" ? t("calculating") : t("calculateCta")}
      </button>

      {status === "error" && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{t("errorMessage")}</p>}

      {result && selectedCoin && (
        <div className="mt-5 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {t("resultSummary", {
              amount: currency(result.amountInvested),
              coin: selectedCoin.name,
              date,
              valueNow: currency(result.valueNow),
            })}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("profitLossLabel")}</dt>
              <dd dir="ltr" className={`font-mono font-semibold ${result.isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {result.profitLoss >= 0 ? "+" : ""}
                {currency(result.profitLoss)} ({result.profitLossPercentage >= 0 ? "+" : ""}
                {formatLocalizedNumber(result.profitLossPercentage, digitStyle, { maximumFractionDigits: 1 })}%)
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("coinsPurchasedLabel")}</dt>
              <dd dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {formatLocalizedNumber(result.coinsPurchased, digitStyle, { maximumFractionDigits: 6 })} {selectedCoin.symbol.toUpperCase()}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{t("historyLimitNote", { days: MAX_HISTORY_DAYS })}</p>
    </SectionCard>
  );
}
