"use client";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { logScalePosition, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { cryptoFormatters } from "./cryptoFormat";

type Props = { coins: CryptoCoin[]; coin: CryptoCoin | undefined; digitStyle: DigitStyle };

export default function CryptoMarketCapLog({ coins, coin, digitStyle }: Props) {
  const t = useTranslations("tools.crypto-converter.capLog");
  if (!coin) return null;
  const f = cryptoFormatters(digitStyle);
  const top10 = [...coins].filter((c) => c.marketCap > 0).sort((a, b) => b.marketCap - a.marketCap).slice(0, 10);
  const rows = top10.some((c) => c.id === coin.id) || !(coin.marketCap > 0) ? top10 : [...top10, coin];
  const caps = rows.map((r) => r.marketCap);
  // Axis spans whole powers of ten around the data so the decade gridlines are meaningful.
  const min = 10 ** Math.floor(Math.log10(Math.min(...caps)));
  const max = 10 ** Math.ceil(Math.log10(Math.max(...caps)));
  const decades = Array.from({ length: Math.round(Math.log10(max / min)) + 1 }, (_, i) => min * 10 ** i);
  // Compare against the largest coin, or — when the picked coin is the largest — the 10th.
  const leader = top10[0]?.id === coin.id ? top10[top10.length - 1] : top10[0];
  const ratio = leader && coin.marketCap > 0 && leader.marketCap > 0 ? Math.max(leader.marketCap, coin.marketCap) / Math.min(leader.marketCap, coin.marketCap) : 0;

  return (
    <SectionCard id="cap-log" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { coin: coin.name })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1" dir="ltr">
          <ul className="space-y-1" data-testid="cap-log">
            {rows.map((r) => {
              const mine = r.id === coin.id;
              return (
                <li key={r.id} className="grid grid-cols-[3.2rem_minmax(0,1fr)_4.2rem] items-center gap-2 text-xs">
                  <span className={`truncate font-mono uppercase ${mine ? "font-bold text-pink-600 dark:text-pink-400" : "text-zinc-500 dark:text-zinc-400"}`}>{r.symbol}</span>
                  <div className="relative h-3.5 rounded bg-zinc-100 dark:bg-zinc-800">
                    {decades.slice(1, -1).map((d) => (
                      <span key={d} className="absolute inset-y-0 w-px bg-zinc-300 dark:bg-zinc-600" style={{ left: `${logScalePosition(d, min, max) * 100}%` }} />
                    ))}
                    <div className={`h-full rounded ${mine ? "bg-pink-500" : "bg-blue-500"}`} style={{ width: `${Math.max(1, logScalePosition(r.marketCap, min, max) * 100)}%` }} />
                  </div>
                  <span className={`text-end font-mono ${mine ? "font-bold text-pink-600 dark:text-pink-400" : "text-zinc-700 dark:text-zinc-300"}`}>{f.compactUsd(r.marketCap)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 grid grid-cols-[3.2rem_minmax(0,1fr)_4.2rem] gap-2">
            <span />
            <div className="relative h-4 font-mono text-[9px] text-zinc-400">
              {decades.map((d) => (
                <span key={d} className="absolute -translate-x-1/2" style={{ left: `${logScalePosition(d, min, max) * 100}%` }}>
                  {f.compactUsd(d)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:w-64">
          <WorkedExampleNote
            title={t("workedTitle")}
            rows={[
              { label: leader?.name ?? "—", value: leader ? f.compactUsd(leader.marketCap) : "—" },
              { label: coin.name, value: f.compactUsd(coin.marketCap) },
              { label: t("rowRatio"), value: ratio ? `${f.num(ratio, ratio < 10 ? 2 : 0)}×` : "—" },
              { label: t("rowDecades"), value: ratio ? f.num(Math.log10(ratio), 2) : "—", emphasize: true, note: t("rowDecadesNote") },
              { label: t("rowRank"), value: coin.marketCapRank ? `#${coin.marketCapRank}` : "—" },
            ]}
          />
        </div>
      </div>
    </SectionCard>
  );
}
