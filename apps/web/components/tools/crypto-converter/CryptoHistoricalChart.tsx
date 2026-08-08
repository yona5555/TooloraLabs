"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CryptoCoinPicker from "./CryptoCoinPicker";
import type { ChartPeriod } from "./types";

type CryptoHistoricalChartProps = {
  coins: CryptoCoin[];
  onCoinDiscovered: (coin: CryptoCoin) => void;
  digitStyle: DigitStyle;
};

type PricePoint = { timestamp: number; price: number };

const PERIODS: ChartPeriod[] = [7, 30, 365];
const CHART_HEIGHT = 200;
const CHART_WIDTH = 640;

export default function CryptoHistoricalChart({ coins, onCoinDiscovered, digitStyle }: CryptoHistoricalChartProps) {
  const t = useTranslations("tools.crypto-converter.chart");
  const [coinId, setCoinId] = useState("bitcoin");
  const [period, setPeriod] = useState<ChartPeriod>(30);
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`/api/crypto/chart?coin=${encodeURIComponent(coinId)}&days=${period}`);
        const json = (await res.json()) as { points: PricePoint[] };
        if (!cancelled) {
          setPoints(json.points);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [coinId, period]);

  const { linePath, areaPath, minPrice, maxPrice } = useMemo(() => {
    if (points.length === 0) {
      return { linePath: "", areaPath: "", minPrice: 0, maxPrice: 0 };
    }
    const prices = points.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1 || 1)) * CHART_WIDTH;
      const y = CHART_HEIGHT - ((p.price - min) / range) * CHART_HEIGHT;
      return `${x},${y}`;
    });

    const line = `M ${coords.join(" L ")}`;
    const area = `M 0,${CHART_HEIGHT} L ${coords.join(" L ")} L ${CHART_WIDTH},${CHART_HEIGHT} Z`;

    return { linePath: line, areaPath: area, minPrice: min, maxPrice: max };
  }, [points]);

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: value < 1 ? 6 : 0 });

  const selectedCoin = coins.find((coin) => coin.id === coinId);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-[280px]">
          <CryptoCoinPicker
            label={t("coinLabel")}
            coins={coins}
            value={coinId}
            onChange={setCoinId}
            onCoinDiscovered={onCoinDiscovered}
          />
        </div>

        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                period === p
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {t(p === 7 ? "periodWeek" : p === 30 ? "periodMonth" : "periodYear")}
            </button>
          ))}
        </div>
      </div>

      <div dir="ltr" className="mt-5 overflow-x-auto">
        {status === "loading" && <p className="py-10 text-center text-sm text-zinc-400">{t("loading")}</p>}
        {status === "error" && <p className="py-10 text-center text-sm text-red-500">{t("error")}</p>}
        {status === "idle" && points.length > 0 && (
          <>
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label={t("title")} className="h-56 w-full" style={{ minWidth: 480 }}>
              <path d={areaPath} className="fill-blue-600/10 dark:fill-blue-400/10" />
              <path d={linePath} fill="none" strokeWidth={2} className="stroke-blue-600 dark:stroke-blue-400" />
            </svg>
            <div className="mt-2 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                {t("lowLabel")}: {currency(minPrice)}
              </span>
              {selectedCoin && (
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})
                </span>
              )}
              <span>
                {t("highLabel")}: {currency(maxPrice)}
              </span>
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}
