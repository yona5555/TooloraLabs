"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CryptoCoin, CryptoGlobalStats } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useCryptoFormatters } from "./cryptoFormat";

type CryptoDominanceDonutProps = {
  stats: CryptoGlobalStats;
  fromCoin: CryptoCoin | undefined;
  toCoin: CryptoCoin | undefined;
  digitStyle: DigitStyle;
};

const SIZE = 168;
const STROKE = 11;
const GAP = 4;

export default function CryptoDominanceDonut({ stats, fromCoin, toCoin, digitStyle }: CryptoDominanceDonutProps) {
  const t = useTranslations("tools.crypto-converter.dominance");
  const pct = stats.marketCapPercentages;
  const total = stats.totalMarketCapUsd;
  // The fourth ring follows the user's own pair: the source coin, or the target when the source is BTC/ETH.
  const own = [fromCoin, toCoin].find((c) => c && !["btc", "eth"].includes(c.symbol.toLowerCase()));

  const rings = [
    { key: "btc", label: "Bitcoin", value: stats.btcDominancePercentage, color: "stroke-amber-500", dot: "bg-amber-500" },
    { key: "eth", label: "Ethereum", value: pct.eth ?? 0, color: "stroke-indigo-500", dot: "bg-indigo-500" },
    { key: "stable", label: t("stablecoins"), value: (pct.usdt ?? 0) + (pct.usdc ?? 0), color: "stroke-teal-500", dot: "bg-teal-500" },
    ...(own && total > 0
      ? [{ key: "own", label: own.name, value: (own.marketCap / total) * 100, color: "stroke-pink-500", dot: "bg-pink-500" }]
      : []),
  ];

  const pctFmt = (v: number) => `${formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: v < 1 ? 3 : 1 })}%`;
  const usd = useCryptoFormatters(digitStyle).compactMoney;
  const change = stats.marketCapChangePercentage24h;

  return (
    <SectionCard id="dominance" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading")}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="@container mt-4">
       <div className="flex flex-col gap-4 @xl:flex-row @xl:items-center">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("heading")} data-testid="dominance-donut">
            {rings.map((r, i) => {
              const radius = SIZE / 2 - STROKE / 2 - i * (STROKE + GAP);
              const circ = 2 * Math.PI * radius;
              return (
                <g key={r.key} transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
                  <circle cx={SIZE / 2} cy={SIZE / 2} r={radius} fill="none" strokeWidth={STROKE} className="stroke-zinc-100 dark:stroke-zinc-800" />
                  <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={`${(Math.min(100, r.value) / 100) * circ} ${circ}`}
                    className={`${r.color} transition-[stroke-dasharray] duration-700`}
                  />
                </g>
              );
            })}
            <text x={SIZE / 2} y={SIZE / 2 + 2} textAnchor="middle" className="fill-zinc-900 font-mono text-[15px] font-bold dark:fill-zinc-100">
              {pctFmt(stats.btcDominancePercentage)}
            </text>
            <text x={SIZE / 2} y={SIZE / 2 + 15} textAnchor="middle" className="fill-zinc-500 text-[8px] dark:fill-zinc-400">
              BTC
            </text>
          </svg>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-zinc-600 dark:text-zinc-300">
            {rings.map((r) => (
              <li key={r.key} className="flex items-center gap-1">
                <span className={`h-2 w-2 shrink-0 rounded-full ${r.dot}`} />
                <span className="truncate">{r.label}</span>
                <span dir="ltr" className="font-mono">{pctFmt(r.value)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 flex-1">
          <WorkedExampleNote
            title={t("workedTitle")}
            rows={[
              { label: t("rowTotal"), value: usd(total) },
              { label: t("rowChange"), value: `${change >= 0 ? "+" : ""}${formatLocalizedNumber(change, digitStyle, { maximumFractionDigits: 2 })}%` },
              ...rings.map((r) => ({
                label: r.label,
                value: usd((total * r.value) / 100),
                emphasize: r.key === "btc",
                note: r.key === "btc" ? t("btcNote", { pct: pctFmt(r.value) }) : undefined,
              })),
              { label: t("rowActive"), value: formatLocalizedNumber(stats.activeCryptocurrencies, digitStyle, { maximumFractionDigits: 0 }) },
            ]}
          />
        </div>
       </div>
      </div>
    </SectionCard>
  );
}
