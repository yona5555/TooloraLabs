"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import {
  FX_VOLATILITY_ZONE_LIMITS,
  changeOverDays,
  conversionSensitivity,
  convertCurrencyAmount,
  crossSeries,
  dailyToCandles,
  fxVolatility,
  fxVolatilityZone,
  pairMilestones,
  rangePosition,
  type CurrencyRate,
  type DailyRate,
  type UsdRateTable,
} from "@tooloralabs/tools";
import IndicatorCard, { PillGroup } from "@/components/tools/markets/IndicatorCard";
import LiveFallback from "@/components/tools/markets/LiveFallback";
import SemiGauge from "@/components/tools/markets/SemiGauge";
import SensitivityBars from "@/components/tools/markets/SensitivityBars";
import { changeColor, useMarketFormatters } from "@/components/tools/markets/fiat";
import { useFixingDate, type Loaded } from "./useForexData";

type PairProps = {
  fromCurrency: CurrencyRate | undefined;
  toCurrency: CurrencyRate | undefined;
  digitStyle: DigitStyle;
};

/** The shared "no ECB history" / loading placeholder for pair indicators. */
function useHistoryFallback(history: Loaded<DailyRate[]>, from: string, to: string, height: number) {
  const t = useTranslations("tools.forex-converter.history");
  if (history.status === "ready") return undefined;
  if (history.status === "loading") return <LiveFallback status="loading" loading={t("loading")} error="" height={height} />;
  const message = history.status === "unsupported" ? t("unsupported", { from, to }) : t("error");
  return <LiveFallback status="error" loading="" error={message} height={height} />;
}

/* ---------- 52-week range (zone strip, §31 type 19) ---------- */

export function ForexRangeStrip({ fromCurrency, toCurrency, history, digitStyle }: PairProps & { history: Loaded<DailyRate[]> }) {
  const t = useTranslations("tools.forex-converter.range");
  const pageDir = useLocale() === "ar" ? "rtl" : "ltr";
  const f = useMarketFormatters(digitStyle);
  const date = useFixingDate();
  const F = fromCurrency?.code ?? "";
  const T = toCurrency?.code ?? "";
  const fallback = useHistoryFallback(history, F, T, 150);
  const m = history.status === "ready" ? pairMilestones(history.data) : null;
  const pos = m ? rangePosition(m.last.rate, m.yearLow.rate, m.yearHigh.rate) : 50;
  const zone = pos < 33.3 ? "low" : pos < 66.7 ? "mid" : "high";

  return (
    <IndicatorCard
      id="range"
      title={t("title")}
      heading={t("heading", { from: F, to: T })}
      intro={t("intro", { from: F, to: T })}
      fallback={m ? undefined : fallback}
      worked={
        m && {
          title: t("workedTitle"),
          rows: [
            { label: t("rowLow"), value: f.rate(m.yearLow.rate), note: date(m.yearLow.date) },
            { label: t("rowHigh"), value: f.rate(m.yearHigh.rate), note: date(m.yearHigh.date) },
            { label: t("rowNow"), value: f.rate(m.last.rate), note: date(m.last.date) },
            { label: t("rowFormula"), value: `(${f.rate(m.last.rate)} − ${f.rate(m.yearLow.rate)}) ÷ ${f.rate(m.yearHigh.rate - m.yearLow.rate)}` },
            { label: t("rowPosition"), value: `${f.num(pos, 1)}%`, emphasize: true, note: t(`zones.${zone}`) },
          ],
        }
      }
    >
      {m && (
        <div dir="ltr" data-testid="range-strip" className="space-y-6">
          {[
            { key: "year", low: m.yearLow, high: m.yearHigh },
            { key: "all", low: m.low, high: m.high },
          ].map((band) => {
            const p = rangePosition(m.last.rate, band.low.rate, band.high.rate);
            return (
              <div key={band.key}>
                <p className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">{t(`bands.${band.key}`)}</p>
                <div className="relative h-8">
                  <div className="absolute inset-x-0 top-2 flex h-4 overflow-hidden rounded-full">
                    <div className="flex-1 bg-red-400/80" />
                    <div className="flex-1 bg-amber-300/80" />
                    <div className="flex-1 bg-emerald-400/80" />
                  </div>
                  <div className="absolute top-0 h-8 w-1 -translate-x-1/2 rounded bg-zinc-900 transition-all duration-700 dark:bg-white" style={{ left: `${p}%` }} />
                </div>
                <div className="mt-1 flex justify-between font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{f.rate(band.low.rate)}</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {f.rate(m.last.rate)} · {f.num(p, 0)}%
                  </span>
                  <span>{f.rate(band.high.rate)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                  {/* The bar is LTR; each date keeps the page's own direction so Arabic dates aren't scrambled. */}
                  <span dir={pageDir}>{date(band.low.date)}</span>
                  <span dir={pageDir}>{date(band.high.date)}</span>
                </div>
              </div>
            );
          })}
          <div className="flex justify-between border-t border-zinc-100 pt-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span>◀ {t("zones.low")}</span>
            <span>{t("zones.mid")}</span>
            <span>{t("zones.high")} ▶</span>
          </div>
        </div>
      )}
    </IndicatorCard>
  );
}

/* ---------- 30-day volatility gauge (§31 type 8) ---------- */

const VOL_MAX = 25;

export function ForexVolatilityGauge({ fromCurrency, toCurrency, recent, digitStyle }: PairProps & { recent: Loaded<UsdRateTable> }) {
  const t = useTranslations("tools.forex-converter.volatility");
  const tH = useTranslations("tools.forex-converter.history");
  const f = useMarketFormatters(digitStyle);
  const F = fromCurrency?.code ?? "";
  const T = toCurrency?.code ?? "";
  const series = recent.status === "ready" ? crossSeries(recent.data, F, T) : [];
  const vol = F !== T ? fxVolatility(series.map((p) => p.rate), 30) : null;
  const zone = vol ? fxVolatilityZone(vol.annualizedPercent) : "low";
  const fallback =
    recent.status === "loading" ? (
      <LiveFallback status="loading" loading={tH("loading")} error="" height={200} />
    ) : (
      <LiveFallback status="error" loading="" error={recent.status === "ready" ? tH("unsupported", { from: F, to: T }) : tH("error")} height={200} />
    );

  return (
    <IndicatorCard
      id="volatility"
      title={t("title")}
      heading={t("heading", { from: F, to: T })}
      intro={t("intro")}
      fallback={vol ? undefined : fallback}
      worked={
        vol && {
          title: t("workedTitle"),
          rows: [
            { label: t("rowReturns"), value: String(vol.returns), note: t("rowReturnsNote") },
            { label: t("rowDaily"), value: `${f.num(vol.dailyPercent, 3)}%`, note: t("rowDailyNote") },
            { label: t("rowScale"), value: `× √252 = × ${f.num(Math.sqrt(252), 2)}` },
            { label: t("rowAnnual"), value: `${f.fixed(vol.annualizedPercent)}%`, emphasize: true, note: t(`zones.${zone}`) },
          ],
        }
      }
    >
      {vol && (
        <div className="flex flex-col items-center">
          <SemiGauge
            value={vol.annualizedPercent}
            max={VOL_MAX}
            zones={[
              { to: FX_VOLATILITY_ZONE_LIMITS.low, className: "stroke-emerald-500" },
              { to: FX_VOLATILITY_ZONE_LIMITS.medium, className: "stroke-amber-400" },
              { to: VOL_MAX, className: "stroke-red-500" },
            ]}
            ticks={[0, FX_VOLATILITY_ZONE_LIMITS.low, FX_VOLATILITY_ZONE_LIMITS.medium, VOL_MAX].map((v) => ({ value: v, label: `${v}%` }))}
            ariaLabel={t("heading", { from: F, to: T })}
            testId="volatility-gauge"
          />
          <p className="-mt-1 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100" dir="ltr" data-testid="volatility-value">
            {f.fixed(vol.annualizedPercent)}%
          </p>
          <p className={`text-sm font-semibold ${zone === "low" ? "text-emerald-600" : zone === "medium" ? "text-amber-600" : "text-red-600"}`}>{t(`zones.${zone}`)}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />{t("zones.low")} &lt;{FX_VOLATILITY_ZONE_LIMITS.low}%</span>
            <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-amber-400" />{t("zones.medium")}</span>
            <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-red-500" />{t("zones.high")} &gt;{FX_VOLATILITY_ZONE_LIMITS.medium}%</span>
          </div>
        </div>
      )}
    </IndicatorCard>
  );
}

/* ---------- Sensitivity trio ±2% (§31 type 12) ---------- */

const SHIFTS = [1, 2, 5] as const;

export function ForexSensitivityTrio({ fromCurrency, toCurrency, amount, digitStyle }: PairProps & { amount: number }) {
  const t = useTranslations("tools.forex-converter.sensitivity");
  const [pct, setPct] = useState<(typeof SHIFTS)[number]>(2);
  const f = useMarketFormatters(digitStyle);
  if (!fromCurrency || !toCurrency) return null;
  const amt = Number.isFinite(amount) ? amount : 0;
  const F = fromCurrency.code;
  const T = toCurrency.code;
  // USD price of one unit is 1 / units-per-USD; shifting it moves the source currency against the target.
  const pts = conversionSensitivity(amt, 1 / fromCurrency.ratePerUsd, 1 / toCurrency.ratePerUsd, pct);
  const rateAt = (p: (typeof pts)[number]) => (p.fromPrice * toCurrency.ratePerUsd);
  const fmt = (v: number) => f.num(v, v !== 0 && Math.abs(v) < 1 ? 6 : 2);
  const delta = (v: number) => `${v > 0 ? "+" : ""}${fmt(v)} ${T}`;

  return (
    <IndicatorCard
      id="sensitivity"
      title={t("title")}
      heading={t("heading", { from: F, to: T })}
      intro={t("intro", { from: F, to: T })}
      controls={<PillGroup label={t("shiftLabel")} options={SHIFTS} value={pct} onChange={setPct} format={(s) => `±${s}%`} />}
      worked={{
        title: t("workedTitle", { pct }),
        rows: [
          { label: t("rowRateNow"), value: `1 ${F} = ${f.rate(rateAt(pts[1]))} ${T}` },
          { label: t("rowShifted", { pct }), value: `× ${f.num(1 + pct / 100, 2)} = ${f.rate(rateAt(pts[2]))}` },
          { label: t("rowAmount"), value: `${f.num(amt, 2)} ${F} × ${f.rate(rateAt(pts[2]))}` },
          { label: t("rowResult"), value: `${fmt(pts[2].converted)} ${T}`, emphasize: true, note: t("rowNote", { diff: delta(pts[2].converted - pts[1].converted) }) },
        ],
      }}
    >
      <SensitivityBars
        points={[
          { label: t("low", { from: F, pct }), sub: `1 ${F} = ${f.rate(rateAt(pts[0]))}`, value: pts[0].converted, display: `${fmt(pts[0].converted)} ${T}`, delta: delta(pts[0].converted - pts[1].converted) },
          { label: t("now"), sub: `1 ${F} = ${f.rate(rateAt(pts[1]))}`, value: pts[1].converted, display: `${fmt(pts[1].converted)} ${T}`, delta: "—" },
          { label: t("high", { from: F, pct }), sub: `1 ${F} = ${f.rate(rateAt(pts[2]))}`, value: pts[2].converted, display: `${fmt(pts[2].converted)} ${T}`, delta: delta(pts[2].converted - pts[1].converted) },
        ]}
      />
    </IndicatorCard>
  );
}

/* ---------- Pair timeline since 1999 (§31 type 9) ---------- */

export function ForexPairTimeline({ fromCurrency, toCurrency, history, digitStyle }: PairProps & { history: Loaded<DailyRate[]> }) {
  const t = useTranslations("tools.forex-converter.timeline");
  const f = useMarketFormatters(digitStyle);
  const date = useFixingDate();
  const F = fromCurrency?.code ?? "";
  const T = toCurrency?.code ?? "";
  const fallback = useHistoryFallback(history, F, T, 220);
  const m = history.status === "ready" ? pairMilestones(history.data) : null;
  const stations = m
    ? [
        { key: "first", mark: m.first, tone: "bg-zinc-400" },
        { key: "low", mark: m.low, tone: "bg-red-500" },
        { key: "high", mark: m.high, tone: "bg-emerald-500" },
        { key: "yearLow", mark: m.yearLow, tone: "bg-red-300" },
        { key: "yearHigh", mark: m.yearHigh, tone: "bg-emerald-300" },
        { key: "last", mark: m.last, tone: "bg-blue-600" },
      ]
        // Same-day stations (e.g. a 52-week high that is also today's fixing) collapse into one.
        .filter((s, i, all) => all.findIndex((o) => o.mark.date === s.mark.date && o.key !== s.key && all.indexOf(o) < i) === -1)
        .sort((a, b) => a.mark.date.localeCompare(b.mark.date))
    : [];
  const fromHigh = m ? (m.last.rate / m.high.rate - 1) * 100 : 0;
  const fromLow = m ? (m.last.rate / m.low.rate - 1) * 100 : 0;

  return (
    <IndicatorCard
      id="timeline"
      title={t("title")}
      heading={t("heading", { from: F, to: T })}
      intro={t("intro")}
      fallback={m ? undefined : fallback}
      worked={
        m && {
          title: t("workedTitle"),
          rows: [
            { label: t("rowHigh"), value: f.rate(m.high.rate), note: date(m.high.date) },
            { label: t("rowLow"), value: f.rate(m.low.rate), note: date(m.low.date) },
            { label: t("rowNow"), value: f.rate(m.last.rate) },
            { label: t("rowFromHigh"), value: `${f.rate(m.last.rate)} ÷ ${f.rate(m.high.rate)} − 1 = ${f.signedPct(fromHigh)}` },
            { label: t("rowFromLow"), value: f.signedPct(fromLow), emphasize: true },
          ],
        }
      }
    >
      {m && (
        <ol className="relative space-y-3 border-s-2 border-zinc-200 ps-5 dark:border-zinc-700" data-testid="pair-timeline">
          {stations.map((s) => (
            <li key={s.key} className="relative">
              <span className={`absolute -start-[1.65rem] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white dark:ring-zinc-900 ${s.tone}`} />
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t(`stations.${s.key}`)}</span>
                <span dir="ltr" className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {f.rate(s.mark.rate)} {T}
                </span>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{date(s.mark.date)}</span>
                <span dir="ltr" className={changeColor(m.last.rate / s.mark.rate - 1)}>
                  {s.key === "last" ? "" : t("vsToday", { pct: f.signedPct((m.last.rate / s.mark.rate - 1) * 100) })}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </IndicatorCard>
  );
}

/* ---------- Period returns (§31 type 1, labeled bars) ---------- */

const PERIODS = [
  { key: "1W", days: 7 },
  { key: "1M", days: 30 },
  { key: "3M", days: 91 },
  { key: "6M", days: 182 },
  { key: "1Y", days: 365 },
  { key: "5Y", days: 1826 },
  { key: "10Y", days: 3652 },
] as const;

export function ForexPeriodReturns({ fromCurrency, toCurrency, history, digitStyle }: PairProps & { history: Loaded<DailyRate[]> }) {
  const t = useTranslations("tools.forex-converter.returns");
  const f = useMarketFormatters(digitStyle);
  const F = fromCurrency?.code ?? "";
  const T = toCurrency?.code ?? "";
  const fallback = useHistoryFallback(history, F, T, 260);
  const points = history.status === "ready" ? history.data : [];
  const bars = PERIODS.flatMap((p) => {
    const v = changeOverDays(points, p.days);
    return v === null ? [] : [{ ...p, value: v }];
  });
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 0.01);
  const year = bars.find((b) => b.key === "1Y");
  const last = points[points.length - 1];
  const yearRef = year && last ? last.rate / (1 + year.value / 100) : null;

  return (
    <IndicatorCard
      id="returns"
      title={t("title")}
      heading={t("heading", { from: F, to: T })}
      intro={t("intro", { from: F })}
      fallback={bars.length ? undefined : fallback}
      worked={
        year && last && yearRef
          ? {
              title: t("workedTitle"),
              rows: [
                { label: t("rowThen"), value: f.rate(yearRef) },
                { label: t("rowNow"), value: f.rate(last.rate) },
                { label: t("rowFormula"), value: `${f.rate(last.rate)} ÷ ${f.rate(yearRef)} − 1` },
                { label: t("rowResult"), value: f.signedPct(year.value), emphasize: true, note: t(year.value >= 0 ? "stronger" : "weaker", { from: F }) },
              ],
            }
          : null
      }
    >
      <div className="space-y-2" dir="ltr" data-testid="period-returns">
        {bars.map((b) => (
          <div key={b.key} className="grid grid-cols-[3rem_1fr_1fr_4.5rem] items-center gap-2">
            <span className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-300">{t(`periods.${b.key}`)}</span>
            <div className="flex h-5 justify-end">
              {b.value < 0 && <div className="h-full rounded-s bg-red-500" style={{ width: `${(Math.abs(b.value) / max) * 100}%` }} />}
            </div>
            <div className="flex h-5 border-s border-zinc-300 dark:border-zinc-600">
              {b.value >= 0 && <div className="h-full rounded-e bg-emerald-500" style={{ width: `${(b.value / max) * 100}%` }} />}
            </div>
            <span className={`text-end font-mono text-xs font-bold ${changeColor(b.value)}`}>{f.signedPct(b.value)}</span>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* ---------- Yearly steps (§31 type 13, stepped diagram) ---------- */

export function ForexYearlySteps({ fromCurrency, toCurrency, amount, history, digitStyle }: PairProps & { amount: number; history: Loaded<DailyRate[]> }) {
  const t = useTranslations("tools.forex-converter.yearly");
  const f = useMarketFormatters(digitStyle);
  const F = fromCurrency?.code ?? "";
  const T = toCurrency?.code ?? "";
  const fallback = useHistoryFallback(history, F, T, 260);
  const amt = Number.isFinite(amount) && amount > 0 ? amount : 1;
  // Each step is the last fixing of a calendar year (the current year uses the latest fixing).
  const monthly = history.status === "ready" ? dailyToCandles(history.data, "month") : [];
  const byYear = new Map<number, number>();
  for (const c of monthly) byYear.set(new Date(c.time * 1000).getUTCFullYear(), c.close);
  const steps = [...byYear.entries()].slice(-10).map(([year, rate]) => ({ year, rate, value: amt * rate }));
  const max = Math.max(...steps.map((s) => s.value), 1e-12);
  const first = steps[0];
  const last = steps[steps.length - 1];

  return (
    <IndicatorCard
      id="yearly"
      title={t("title")}
      heading={t("heading", { amount: f.num(amt, 2), from: F, to: T })}
      intro={t("intro")}
      fallback={steps.length > 1 ? undefined : fallback}
      worked={
        first && last
          ? {
              title: t("workedTitle"),
              rows: [
                { label: t("rowThen", { year: first.year }), value: `${f.num(amt, 2)} × ${f.rate(first.rate)} = ${f.num(first.value, 2)} ${T}` },
                { label: t("rowNow", { year: last.year }), value: `${f.num(amt, 2)} × ${f.rate(last.rate)} = ${f.num(last.value, 2)} ${T}` },
                { label: t("rowDiff"), value: `${f.num(last.value - first.value, 2)} ${T}`, emphasize: true, note: f.signedPct((last.value / first.value - 1) * 100) },
              ],
            }
          : null
      }
    >
      <div className="flex h-56 items-end gap-1.5" dir="ltr" data-testid="yearly-steps">
        {steps.map((s, i) => (
          <div key={s.year} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1 self-stretch">
            <span className="w-full truncate text-center font-mono text-[10px] font-semibold text-zinc-700 dark:text-zinc-200">{f.num(s.value, s.value < 10 ? 3 : 1)}</span>
            <div
              className={`w-full rounded-t ${i === steps.length - 1 ? "bg-blue-600" : s.value >= (steps[i - 1]?.value ?? s.value) ? "bg-emerald-500/80" : "bg-red-500/80"}`}
              style={{ height: `${Math.max(4, (s.value / max) * 85)}%` }}
            />
            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">{s.year}</span>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* ---------- Side-by-side comparison cards (§31 type 16) ---------- */

export function ForexComparisonCards({ fromCurrency, toCurrency, recent, history, digitStyle }: PairProps & { recent: Loaded<UsdRateTable>; history: Loaded<DailyRate[]> }) {
  const t = useTranslations("tools.forex-converter.comparison");
  const f = useMarketFormatters(digitStyle);
  if (!fromCurrency || !toCurrency) return null;
  const table = recent.status === "ready" ? recent.data : null;
  const stats = (c: CurrencyRate) => {
    const s = table ? crossSeries(table, c.code, "USD") : [];
    const vol = fxVolatility(s.map((p) => p.rate), 30);
    return {
      code: c.code,
      unit: 1 / c.ratePerUsd,
      d1: changeOverDays(s, 1),
      d30: changeOverDays(s, 30),
      y1: changeOverDays(s, 365),
      vol: c.code === "USD" ? 0 : vol?.annualizedPercent ?? null,
      covered: c.code === "USD" || s.length > 1,
    };
  };
  const a = stats(fromCurrency);
  const b = stats(toCurrency);
  const ratio = convertCurrencyAmount(1, fromCurrency.ratePerUsd, toCurrency.ratePerUsd);
  const pct = (v: number | null) => (v === null ? "—" : f.signedPct(v));
  const m = history.status === "ready" ? pairMilestones(history.data) : null;

  const card = (s: ReturnType<typeof stats>, accent: string) => (
    <div className={`min-w-0 rounded-xl border-t-4 bg-zinc-50 p-4 dark:bg-zinc-800/40 ${accent}`}>
      <p dir="ltr" className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
        1 {s.code}
      </p>
      <p dir="ltr" className="font-mono text-xl font-bold text-blue-700 dark:text-blue-300" data-testid={`compare-${s.code}`}>
        {f.money(s.unit)}
      </p>
      <dl className="mt-3 space-y-1.5 text-xs">
        {[
          { k: "d1", v: s.code === "USD" ? "0%" : pct(s.d1), raw: s.d1 },
          { k: "d30", v: s.code === "USD" ? "0%" : pct(s.d30), raw: s.d30 },
          { k: "y1", v: s.code === "USD" ? "0%" : pct(s.y1), raw: s.y1 },
          { k: "vol", v: s.vol === null ? "—" : `${f.fixed(s.vol)}%`, raw: null },
        ].map((r) => (
          <div key={r.k} className="flex justify-between gap-2">
            <dt className="text-zinc-500 dark:text-zinc-400">{t(`rows.${r.k}`)}</dt>
            <dd dir="ltr" className={`font-mono font-semibold ${r.raw === null ? "text-zinc-800 dark:text-zinc-100" : changeColor(r.raw)}`}>
              {r.v}
            </dd>
          </div>
        ))}
      </dl>
      {!s.covered && <p className="mt-2 text-[11px] text-zinc-400">{t("noHistory")}</p>}
    </div>
  );

  return (
    <IndicatorCard
      id="compare"
      title={t("title")}
      heading={t("heading", { from: a.code, to: b.code })}
      intro={t("intro", { currency: f.currency })}
      worked={{
        title: t("workedTitle"),
        rows: [
          { label: t("rowA", { code: a.code }), value: f.money(a.unit) },
          { label: t("rowB", { code: b.code }), value: f.money(b.unit) },
          { label: t("rowRatio"), value: `${f.money(a.unit)} ÷ ${f.money(b.unit)}` },
          { label: t("rowResult"), value: `1 ${a.code} = ${f.rate(ratio)} ${b.code}`, emphasize: true, note: m ? t("rowRangeNote", { low: f.rate(m.low.rate), high: f.rate(m.high.rate) }) : undefined },
        ],
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="comparison-cards">
        {card(a, "border-blue-600")}
        {card(b, "border-amber-500")}
      </div>
    </IndicatorCard>
  );
}
