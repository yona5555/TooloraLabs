"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import {
  convertCurrencyAmount,
  crossRateMatrix,
  currencyStrength,
  dailyMovers,
  findCurrencyByCode,
  type CurrencyRate,
  type UsdRateTable,
} from "@tooloralabs/tools";
import IndicatorCard, { PillGroup } from "@/components/tools/markets/IndicatorCard";
import LiveFallback from "@/components/tools/markets/LiveFallback";
import { changeColor, useMarketFormatters } from "@/components/tools/markets/fiat";
import { ECB_CURRENCIES } from "@/lib/forex/ecb";
import { FEATURED_CURRENCY_CODES } from "@/lib/forex/currencyNames";
import { useCurrencyName, useFixingDate, type Loaded } from "./useForexData";

const STRENGTH_CODES = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD", "CNY", "SEK"];

function recentFallback(recent: Loaded<UsdRateTable>, loading: string, error: string, height: number) {
  if (recent.status === "ready") return undefined;
  return <LiveFallback status={recent.status === "loading" ? "loading" : "error"} loading={loading} error={error} height={height} />;
}

/* ---------- Currency strength meter (§31 type 5, ranked horizontal bars) ---------- */

const LOOKBACKS = [5, 21, 63] as const;

export function ForexStrengthMeter({ recent, highlight, digitStyle }: { recent: Loaded<UsdRateTable>; highlight: string[]; digitStyle: DigitStyle }) {
  const t = useTranslations("tools.forex-converter.strength");
  const tH = useTranslations("tools.forex-converter.history");
  const f = useMarketFormatters(digitStyle);
  const [lookback, setLookback] = useState<(typeof LOOKBACKS)[number]>(21);
  const codes = [...new Set([...STRENGTH_CODES, ...highlight.filter((c) => (ECB_CURRENCIES as readonly string[]).includes(c))])];
  const scores = recent.status === "ready" ? currencyStrength(recent.data, codes, lookback) : [];
  const max = Math.max(...scores.map((s) => Math.abs(s.changePercent)), 0.01);
  const top = scores[0];
  const mean = top && recent.status === "ready" ? (() => {
    const n = recent.data.dates.length;
    const from = Math.max(0, n - 1 - lookback);
    const s = recent.data.rates[top.code];
    return top.code === "USD" ? -top.changePercent : Math.log(s[from] / s[n - 1]) * 100 - top.changePercent;
  })() : 0;

  return (
    <IndicatorCard
      id="strength"
      title={t("title")}
      heading={t("heading")}
      intro={t("intro")}
      controls={<PillGroup label={t("lookbackLabel")} options={LOOKBACKS} value={lookback} onChange={setLookback} format={(d) => t(`lookback.${d}`)} />}
      fallback={recentFallback(recent, tH("loading"), tH("error"), 320)}
      worked={
        top
          ? {
              title: t("workedTitle"),
              rows: [
                { label: t("rowOwn", { code: top.code }), value: f.signedPct(top.changePercent + mean, 3) },
                { label: t("rowBasket"), value: f.signedPct(mean, 3), note: t("rowBasketNote", { n: scores.length }) },
                { label: t("rowFormula"), value: `${f.signedPct(top.changePercent + mean, 3)} − (${f.signedPct(mean, 3)})` },
                { label: t("rowResult", { code: top.code }), value: f.signedPct(top.changePercent, 3), emphasize: true },
              ],
            }
          : null
      }
    >
      <ul className="space-y-1.5" dir="ltr" data-testid="strength-meter">
        {scores.map((s) => (
          <li key={s.code} className="grid grid-cols-[3rem_1fr_1fr_4.5rem] items-center gap-2">
            <span className={`font-mono text-xs font-bold ${highlight.includes(s.code) ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-200"}`}>{s.code}</span>
            <div className="flex h-4 justify-end">
              {s.changePercent < 0 && <div className="h-full rounded-s bg-red-500" style={{ width: `${(Math.abs(s.changePercent) / max) * 100}%` }} />}
            </div>
            <div className="flex h-4 border-s border-zinc-300 dark:border-zinc-600">
              {s.changePercent >= 0 && <div className="h-full rounded-e bg-emerald-500" style={{ width: `${(s.changePercent / max) * 100}%` }} />}
            </div>
            <span className={`text-end font-mono text-xs font-semibold ${changeColor(s.changePercent)}`}>{f.signedPct(s.changePercent)}</span>
          </li>
        ))}
      </ul>
    </IndicatorCard>
  );
}

/* ---------- Top movers (§31 type 4, icon comparison rows) ---------- */

export function ForexTopMovers({ recent, onPick, digitStyle }: { recent: Loaded<UsdRateTable>; onPick: (code: string) => void; digitStyle: DigitStyle }) {
  const t = useTranslations("tools.forex-converter.movers");
  const tH = useTranslations("tools.forex-converter.history");
  const f = useMarketFormatters(digitStyle);
  const name = useCurrencyName();
  const date = useFixingDate();
  const table = recent.status === "ready" ? recent.data : null;
  const all = table ? dailyMovers(table, ECB_CURRENCIES.filter((c) => c !== "USD")) : [];
  // Only real gainers/losers: on a quiet day a side may hold fewer than five currencies.
  const gainers = all.filter((m) => m.changePercent > 0).slice(0, 5);
  const losers = all.filter((m) => m.changePercent < 0).reverse().slice(0, 5);
  const top = gainers[0];
  const n = table?.dates.length ?? 0;
  const s = top && table ? table.rates[top.code] : null;

  const row = (m: (typeof all)[number]) => (
    <li key={m.code}>
      <button
        type="button"
        onClick={() => onPick(m.code)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
      >
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${m.changePercent >= 0 ? "bg-emerald-500" : "bg-red-500"}`} aria-hidden>
          {m.changePercent >= 0 ? "▲" : "▼"}
        </span>
        <span dir="ltr" className="w-10 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-100">
          {m.code}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{name(m.code)}</span>
        <span dir="ltr" className={`font-mono text-xs font-semibold ${changeColor(m.changePercent)}`}>
          {f.signedPct(m.changePercent)}
        </span>
      </button>
    </li>
  );

  return (
    <IndicatorCard
      id="movers"
      title={t("title")}
      heading={t("heading", { date: table ? date(table.dates[n - 1]) : "" })}
      intro={t("intro")}
      fallback={recentFallback(recent, tH("loading"), tH("error"), 260)}
      worked={
        top && s && table
          ? {
              title: t("workedTitle"),
              rows: [
                { label: t("rowPrev", { code: top.code }), value: `1 USD = ${f.rate(s[n - 2])}`, note: date(table.dates[n - 2]) },
                { label: t("rowNow", { code: top.code }), value: `1 USD = ${f.rate(s[n - 1])}`, note: date(table.dates[n - 1]) },
                { label: t("rowFormula"), value: `${f.rate(s[n - 2])} ÷ ${f.rate(s[n - 1])} − 1` },
                { label: t("rowResult", { code: top.code }), value: f.signedPct(top.changePercent, 3), emphasize: true },
              ],
            }
          : null
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="top-movers">
        <div>
          <p className="mb-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">{t("gainers")}</p>
          <ul>{gainers.map(row)}</ul>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-red-700 dark:text-red-400">{t("losers")}</p>
          <ul>{losers.map(row)}</ul>
        </div>
      </div>
    </IndicatorCard>
  );
}

/* ---------- Cross-rate table (§31 type 17, tagged reference table) ---------- */

const CROSS_CODES = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY"];

export function ForexCrossRates({ currencies, fromCode, toCode, digitStyle }: { currencies: CurrencyRate[]; fromCode: string; toCode: string; digitStyle: DigitStyle }) {
  const t = useTranslations("tools.forex-converter.crossRates");
  const f = useMarketFormatters(digitStyle);
  const codes = [...new Set([...CROSS_CODES.slice(0, 6), fromCode, toCode, ...CROSS_CODES.slice(6)])].filter((c) => findCurrencyByCode(currencies, c)).slice(0, 8);
  const rates = Object.fromEntries(codes.map((c) => [c, findCurrencyByCode(currencies, c)!.ratePerUsd]));
  const matrix = crossRateMatrix(codes, rates);
  const fi = codes.indexOf(fromCode);
  const ti = codes.indexOf(toCode);
  if (codes.length < 2) return null;
  const [r, c] = fi >= 0 && ti >= 0 && fi !== ti ? [fi, ti] : [1, 3];

  return (
    <IndicatorCard
      id="cross-rates"
      title={t("title")}
      heading={t("heading")}
      intro={t("intro")}
      worked={{
        title: t("workedTitle"),
        rows: [
          { label: t("rowRow", { code: codes[r] }), value: `1 USD = ${f.rate(rates[codes[r]])} ${codes[r]}` },
          { label: t("rowCol", { code: codes[c] }), value: `1 USD = ${f.rate(rates[codes[c]])} ${codes[c]}` },
          { label: t("rowFormula"), value: `${f.rate(rates[codes[c]])} ÷ ${f.rate(rates[codes[r]])}` },
          { label: t("rowResult"), value: `1 ${codes[r]} = ${f.rate(matrix[r][c] ?? 0)} ${codes[c]}`, emphasize: true },
        ],
      }}
    >
      <div className="overflow-x-auto" dir="ltr">
        <table className="w-full min-w-[520px] text-xs" data-testid="cross-rates">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800">
              <th className="px-2 py-1.5 text-start text-zinc-400">1 ↓ =</th>
              {codes.map((code, j) => (
                <th key={code} className={`px-2 py-1.5 text-end font-mono font-bold ${j === ti ? "text-blue-700 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}`}>
                  {code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.map((rowCode, i) => (
              <tr key={rowCode} className={`border-t border-zinc-100 dark:border-zinc-800 ${i === fi ? "bg-blue-50/60 dark:bg-blue-500/10" : ""}`}>
                <th className={`px-2 py-1.5 text-start font-mono font-bold ${i === fi ? "text-blue-700 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}`}>{rowCode}</th>
                {matrix[i].map((v, j) => (
                  <td
                    key={j}
                    className={`px-2 py-1.5 text-end font-mono ${i === r && j === c ? "rounded bg-blue-600 font-bold text-white" : i === j ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-800 dark:text-zinc-100"}`}
                  >
                    {v === null ? "—" : f.rate(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IndicatorCard>
  );
}

/* ---------- Major & Arab currencies (§31 type 17 with tags) ---------- */

const PEGGED_TO_USD = new Set(["SAR", "AED", "QAR", "BHD", "OMR", "JOD", "HKD", "DJF"]);
const ARAB = new Set(["SAR", "AED", "EGP", "KWD", "QAR", "BHD", "OMR", "JOD", "MAD", "DZD", "TND", "IQD", "LBP", "LYD"]);

export function ForexTopList({ currencies, fromCurrency, amount, digitStyle }: { currencies: CurrencyRate[]; fromCurrency: CurrencyRate | undefined; amount: number; digitStyle: DigitStyle }) {
  const t = useTranslations("tools.forex-converter.topList");
  const f = useMarketFormatters(digitStyle);
  const name = useCurrencyName();
  const codes = [...FEATURED_CURRENCY_CODES, "CHF", "CNY", "INR", "QAR", "BHD", "OMR", "JOD", "MAD"];
  const rows = codes.flatMap((code) => {
    const c = findCurrencyByCode(currencies, code);
    return c ? [c] : [];
  });
  if (!fromCurrency || rows.length === 0) return null;
  const amt = Number.isFinite(amount) ? amount : 0;
  const tag = (code: string) => (PEGGED_TO_USD.has(code) ? "pegged" : ARAB.has(code) ? "arab" : code === "USD" ? "base" : "floating");
  const tagTone: Record<string, string> = {
    pegged: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    arab: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    base: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    floating: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  };
  const ex = rows.find((c) => c.code === "SAR") ?? rows[0];

  return (
    <IndicatorCard
      id="top-list"
      title={t("title")}
      heading={t("heading", { amount: f.num(amt, 2), code: fromCurrency.code })}
      intro={t("intro")}
      worked={{
        title: t("workedTitle"),
        rows: [
          { label: t("rowAmount"), value: `${f.num(amt, 2)} ${fromCurrency.code}` },
          { label: t("rowUsd"), value: `÷ ${f.rate(fromCurrency.ratePerUsd)} = ${f.num(amt / fromCurrency.ratePerUsd, 4)} USD` },
          { label: t("rowTarget", { code: ex.code }), value: `× ${f.rate(ex.ratePerUsd)}` },
          { label: t("rowResult"), value: `${f.num(convertCurrencyAmount(amt, fromCurrency.ratePerUsd, ex.ratePerUsd), 2)} ${ex.code}`, emphasize: true, note: t(`tags.${tag(ex.code)}`) },
        ],
      }}
    >
      <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
        <table className="w-full min-w-[420px] text-sm" data-testid="top-list">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr className="text-xs text-zinc-500 dark:text-zinc-400">
              <th className="px-3 py-2 text-start font-medium">{t("columnCurrency")}</th>
              <th className="px-3 py-2 text-start font-medium">{t("columnTag")}</th>
              <th className="px-3 py-2 text-end font-medium">{t("columnRatePerUsd")}</th>
              <th className="px-3 py-2 text-end font-medium">
                <span dir="ltr">
                  {f.num(amt, 2)} {fromCurrency.code}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.code} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    <span dir="ltr" className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {c.code}
                    </span>
                    <span className="truncate text-zinc-900 dark:text-zinc-100">{name(c.code, c.name)}</span>
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagTone[tag(c.code)]}`}>{t(`tags.${tag(c.code)}`)}</span>
                </td>
                <td dir="ltr" className="px-3 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">
                  {f.rate(c.ratePerUsd)}
                </td>
                <td dir="ltr" className="px-3 py-2 text-end font-mono font-semibold text-blue-700 dark:text-blue-300">
                  {f.num(convertCurrencyAmount(amt, fromCurrency.ratePerUsd, c.ratePerUsd), 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IndicatorCard>
  );
}
