"use client";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { supplyBreakdown, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { cryptoFormatters } from "./cryptoFormat";

type Props = { coin: CryptoCoin | undefined; digitStyle: DigitStyle };

export default function CryptoSupplyBar({ coin, digitStyle }: Props) {
  const t = useTranslations("tools.crypto-converter.supply");
  if (!coin) return null;
  const f = cryptoFormatters(digitStyle);
  const b = supplyBreakdown(coin.circulatingSupply, coin.totalSupply, coin.maxSupply);
  const sym = coin.symbol.toUpperCase();
  const segments = b
    ? [
        { key: "circulating", pct: b.circulatingPercent, value: coin.circulatingSupply ?? 0, cls: "bg-blue-600" },
        { key: "locked", pct: b.lockedPercent, value: (coin.totalSupply ?? 0) - (coin.circulatingSupply ?? 0), cls: "bg-violet-400" },
        { key: "unissued", pct: b.unissuedPercent, value: (coin.maxSupply ?? 0) - Math.max(coin.totalSupply ?? 0, coin.circulatingSupply ?? 0), cls: "bg-zinc-300 dark:bg-zinc-600" },
      ].filter((s) => s.pct > 0.05)
    : [];

  return (
    <SectionCard id="supply" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { coin: coin.name })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      {!b ? (
        <p className="mt-4 rounded-xl bg-zinc-50 p-6 text-center text-sm text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-300">{t("missing", { coin: coin.name })}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div dir="ltr" className="flex h-12 overflow-hidden rounded-xl" data-testid="supply-bar">
              {segments.map((s) => (
                <div key={s.key} className={`flex items-center justify-center font-mono text-xs font-semibold text-white ${s.cls}`} style={{ width: `${s.pct}%` }}>
                  {s.pct >= 8 ? `${f.num(s.pct, 1)}%` : ""}
                </div>
              ))}
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {segments.map((s) => (
                <li key={s.key} className="flex items-center gap-2">
                  <span className={`h-3 w-3 shrink-0 rounded ${s.cls}`} />
                  <span className="text-zinc-700 dark:text-zinc-200">{t(s.key)}</span>
                  <span dir="ltr" className="ms-auto font-mono text-zinc-900 dark:text-zinc-100">
                    {f.compact(s.value)} {sym} · {f.num(s.pct, 1)}%
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{t(b.basis === "max" ? "basisMax" : "basisTotal")}</p>
          </div>
          <div className="lg:w-64">
            <WorkedExampleNote
              title={t("workedTitle")}
              rows={[
                { label: t("circulating"), value: `${f.compact(coin.circulatingSupply ?? 0)} ${sym}` },
                { label: t("totalLabel"), value: coin.totalSupply ? `${f.compact(coin.totalSupply)} ${sym}` : "—" },
                { label: t("maxLabel"), value: coin.maxSupply ? `${f.compact(coin.maxSupply)} ${sym}` : t("uncapped") },
                { label: t("rowShare"), value: `${f.num(b.circulatingPercent, 2)}%`, emphasize: true, note: t(b.basis === "max" ? "rowShareNoteMax" : "rowShareNoteTotal") },
                { label: t("rowCapCheck"), value: f.compactUsd((coin.circulatingSupply ?? 0) * coin.currentPrice), note: t("rowCapCheckNote") },
              ]}
            />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
