"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { VOLATILITY_ZONE_LIMITS, realizedVolatility, volatilityZone, type Candle, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import LiveFallback from "@/components/tools/markets/LiveFallback";
import { useCryptoFormatters } from "./cryptoFormat";

type Props = { coin: CryptoCoin | undefined; digitStyle: DigitStyle };

const W = 240;
const H = 140;
const R = 100;
const CX = W / 2;
const CY = 120;
const GAUGE_MAX = 150; // % annualized at the right end of the dial

const polar = (pct: number, r = R) => {
  const a = Math.PI * (1 - Math.min(1, Math.max(0, pct / GAUGE_MAX)));
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
};
const arc = (from: number, to: number) => {
  const [x1, y1] = polar(from);
  const [x2, y2] = polar(to);
  return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
};

export default function CryptoVolatilityGauge({ coin, digitStyle }: Props) {
  const t = useTranslations("tools.crypto-converter.volatility");
  const symbol = coin?.symbol ?? "btc";
  const [data, setData] = useState<{ symbol: string; candles: Candle[] | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/crypto/candles?symbol=${encodeURIComponent(symbol)}&tf=1D`)
      .then(async (r) => (r.ok ? ((await r.json()) as { candles: Candle[] }).candles : null))
      .then((candles) => !cancelled && setData({ symbol, candles }))
      .catch(() => !cancelled && setData({ symbol, candles: null }));
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const f = useCryptoFormatters(digitStyle);
  const current = data && data.symbol === symbol ? data : null;
  const vol = current?.candles ? realizedVolatility(current.candles, 30) : null;
  const zone = vol ? volatilityZone(vol.annualizedPercent) : null;
  const [nx, ny] = polar(vol?.annualizedPercent ?? 0, R - 18);
  const sym = symbol.toUpperCase();

  return (
    <SectionCard id="volatility" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { coin: coin?.name ?? sym })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      {!vol ? (
        <LiveFallback status={current ? "error" : "loading"} loading={t("loading")} error={t("error", { symbol: sym })} height={200} />
      ) : (
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("heading", { coin: coin?.name ?? sym })} data-testid="volatility-gauge">
              <path d={arc(0, VOLATILITY_ZONE_LIMITS.low)} fill="none" strokeWidth={18} className="stroke-emerald-500" />
              <path d={arc(VOLATILITY_ZONE_LIMITS.low, VOLATILITY_ZONE_LIMITS.medium)} fill="none" strokeWidth={18} className="stroke-amber-400" />
              <path d={arc(VOLATILITY_ZONE_LIMITS.medium, GAUGE_MAX)} fill="none" strokeWidth={18} className="stroke-red-500" />
              <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={3} strokeLinecap="round" className="stroke-zinc-800 transition-all duration-700 dark:stroke-zinc-100" />
              <circle cx={CX} cy={CY} r={6} className="fill-zinc-800 dark:fill-zinc-100" />
              {[0, VOLATILITY_ZONE_LIMITS.low, VOLATILITY_ZONE_LIMITS.medium, GAUGE_MAX].map((v) => {
                const [x, y] = polar(v, R + 14);
                return (
                  <text key={v} x={x} y={y} textAnchor="middle" className="fill-zinc-400 font-mono text-[9px]">
                    {v}%
                  </text>
                );
              })}
            </svg>
            <p className="-mt-1 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100" dir="ltr" data-testid="volatility-value">
              {f.num(vol.annualizedPercent, 1)}%
            </p>
            <p className={`text-sm font-semibold ${zone === "low" ? "text-emerald-600" : zone === "medium" ? "text-amber-600" : "text-red-600"}`}>{t(`zones.${zone}`)}</p>
            <div className="mt-2 flex gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />{t("zones.low")} &lt;{VOLATILITY_ZONE_LIMITS.low}%</span>
              <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-amber-400" />{t("zones.medium")}</span>
              <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-red-500" />{t("zones.high")} &gt;{VOLATILITY_ZONE_LIMITS.medium}%</span>
            </div>
          </div>
          <div className="lg:w-64">
            <WorkedExampleNote
              title={t("workedTitle")}
              rows={[
                { label: t("rowReturns"), value: String(vol.returns), note: t("rowReturnsNote") },
                { label: t("rowDaily"), value: `${f.num(vol.dailyPercent, 2)}%`, note: t("rowDailyNote") },
                { label: t("rowScale"), value: `× √365 = × ${f.num(Math.sqrt(365), 2)}` },
                { label: t("rowAnnual"), value: `${f.num(vol.annualizedPercent, 1)}%`, emphasize: true, note: t(`zones.${zone}`) },
              ]}
            />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
