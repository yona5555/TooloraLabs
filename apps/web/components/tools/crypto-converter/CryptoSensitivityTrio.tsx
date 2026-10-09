"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { conversionSensitivity, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useCryptoFormatters } from "./cryptoFormat";

type Props = { fromCoin: CryptoCoin | undefined; toCoin: CryptoCoin | undefined; amount: number; digitStyle: DigitStyle };

const SHIFTS = [5, 10, 20];

export default function CryptoSensitivityTrio({ fromCoin, toCoin, amount, digitStyle }: Props) {
  const t = useTranslations("tools.crypto-converter.sensitivity");
  const [pct, setPct] = useState(10);
  const f = useCryptoFormatters(digitStyle);
  if (!fromCoin || !toCoin) return null;
  const amt = Number.isFinite(amount) ? amount : 0;
  const points = conversionSensitivity(amt, fromCoin.currentPrice, toCoin.currentPrice, pct);
  const from = fromCoin.symbol.toUpperCase();
  const to = toCoin.symbol.toUpperCase();
  const max = Math.max(...points.map((p) => p.converted), 1e-12);
  const tone = ["border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-500/10", "border-blue-400 bg-blue-50 dark:border-blue-400/60 dark:bg-blue-500/10", "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"];
  const bar = ["bg-red-500", "bg-blue-600", "bg-emerald-500"];

  return (
    <SectionCard id="sensitivity" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { from, to })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { from, to })}</p>
      <div className="mt-3 flex items-center gap-1.5" role="group" aria-label={t("shiftLabel")}>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("shiftLabel")}</span>
        {SHIFTS.map((s) => (
          <button key={s} type="button" aria-pressed={pct === s} onClick={() => setPct(s)} className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-medium ${pct === s ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"}`}>
            ±{s}%
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-3" data-testid="sensitivity-trio">
          {points.map((p, i) => (
            <div key={p.shiftPercent} className={`flex flex-col rounded-xl border p-3 ${tone[i]}`}>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{t(i === 0 ? "low" : i === 1 ? "now" : "high")}</span>
              <span dir="ltr" className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {from} {f.money(p.fromPrice)}
              </span>
              <div className="mt-2 flex h-24 items-end">
                <div className={`w-full rounded-t-md ${bar[i]}`} style={{ height: `${(p.converted / max) * 100}%` }} />
              </div>
              <span dir="ltr" className="mt-2 truncate font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {f.amount(p.converted)} {to}
              </span>
              <span dir="ltr" className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {p.shiftPercent === 0 ? "—" : `${p.shiftPercent > 0 ? "+" : ""}${f.amount(p.converted - points[1].converted)} ${to}`}
              </span>
            </div>
          ))}
        </div>
        <div className="lg:w-64">
          <WorkedExampleNote
            title={t("workedTitle", { pct })}
            rows={[
              { label: t("rowPriceNow", { symbol: from }), value: f.money(fromCoin.currentPrice) },
              { label: t("rowShifted"), value: `× ${f.num(1 + pct / 100, 2)} = ${f.money(points[2].fromPrice)}` },
              { label: t("rowValue"), value: `${f.amount(amt)} × ${f.money(points[2].fromPrice)}` },
              { label: t("rowToPrice", { symbol: to }), value: `÷ ${f.money(toCoin.currentPrice)}` },
              { label: t("rowResult"), value: `${f.amount(points[2].converted)} ${to}`, emphasize: true, note: t("rowNote", { pct }) },
            ]}
          />
        </div>
      </div>
    </SectionCard>
  );
}
