"use client";
import { useLocale, useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { convertCurrencyAmount, crossSeries, type CurrencyRate, type UsdRateTable } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import CopyButton from "@/components/tool-ui/CopyButton";
import Sparkline, { useRelativeUpdatedLabel } from "@/components/tools/markets/Sparkline";
import { changeColor, useMarketFormatters } from "@/components/tools/markets/fiat";
import ShareExportModal from "@/components/tools/markets/ShareExportModal";
import { useCurrencyName, type Loaded } from "./useForexData";

type Props = {
  fromCurrency: CurrencyRate | undefined;
  toCurrency: CurrencyRate | undefined;
  amountText: string;
  amount: number;
  lastUpdatedUnix: number | null;
  recent: Loaded<UsdRateTable>;
  digitStyle: DigitStyle;
};

const SPARK_DAYS = 30;

/** Last 30 ECB fixings of 1 `base` in `target`, or null while loading / "none" when the ECB doesn't fix either. */
function trend(recent: Loaded<UsdRateTable>, base: string, target: string): number[] | null | "none" {
  if (recent.status === "loading") return null;
  if (recent.status !== "ready") return "none";
  const s = crossSeries(recent.data, base, target).slice(-SPARK_DAYS);
  return s.length > 1 ? s.map((p) => p.rate) : "none";
}

function CurrencyNode({
  currency,
  other,
  recent,
  amountLabel,
  digitStyle,
}: {
  currency: CurrencyRate;
  other: CurrencyRate;
  recent: Loaded<UsdRateTable>;
  amountLabel: string;
  digitStyle: DigitStyle;
}) {
  const t = useTranslations("tools.forex-converter.liveFlow");
  const f = useMarketFormatters(digitStyle);
  const name = useCurrencyName();
  const values = trend(recent, currency.code, other.code);
  const change = Array.isArray(values) ? (values[values.length - 1] / values[0] - 1) * 100 : null;

  return (
    <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="flex items-center gap-2">
        <span dir="ltr" className="rounded bg-blue-600 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
          {currency.code}
        </span>
        <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name(currency.code, currency.name)}</span>
      </div>
      <div dir="ltr" className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100" data-testid={`unit-value-${currency.code}`}>
          {f.money(1 / currency.ratePerUsd)}
        </span>
        <span className={`font-mono text-xs font-semibold ${changeColor(change)}`}>{change === null ? "—" : f.signedPct(change)}</span>
      </div>
      <div dir="ltr" className="mt-1 flex items-end justify-between gap-1">
        {values === "none" ? (
          <span className="text-[10px] text-zinc-400">{t("noTrend")}</span>
        ) : (
          <Sparkline values={values} up={(change ?? 0) >= 0} />
        )}
        <span className="text-[10px] text-zinc-400">{t("spark30d", { code: other.code })}</span>
      </div>
      <p dir="ltr" className="mt-1 truncate text-end font-mono text-sm font-semibold text-blue-700 dark:text-blue-300">
        {amountLabel}
      </p>
    </div>
  );
}

/** The converted amount inside an animated flow: source → (× rate) → target, with copy/share and the math beside it. */
export default function ForexLiveFlow({ fromCurrency, toCurrency, amountText, amount, lastUpdatedUnix, recent, digitStyle }: Props) {
  const t = useTranslations("tools.forex-converter.liveFlow");
  const tAbove = useTranslations("tools.forex-converter.aboveFold");
  const locale = useLocale();
  const f = useMarketFormatters(digitStyle);
  const updatedLabel = useRelativeUpdatedLabel((lastUpdatedUnix ?? 0) * 1000, locale);
  if (!fromCurrency || !toCurrency) return null;

  const amt = Number.isFinite(amount) ? amount : 0;
  const converted = convertCurrencyAmount(amt, fromCurrency.ratePerUsd, toCurrency.ratePerUsd);
  const rate = convertCurrencyAmount(1, fromCurrency.ratePerUsd, toCurrency.ratePerUsd);
  const usdValue = amt / fromCurrency.ratePerUsd;
  const F = fromCurrency.code;
  const T = toCurrency.code;
  const resultText = f.num(converted, converted !== 0 && Math.abs(converted) < 1 ? 6 : 2);
  const summaryText = `${resultText} ${T}`;
  const updated = lastUpdatedUnix ? tAbove("lastUpdated", { time: updatedLabel }) : "";

  return (
    <SectionCard
      id="indicators"
      title={t("title")}
      action={
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white" data-testid="live-badge">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          {t("badge")}
        </span>
      }
    >
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { from: F, to: T })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="@container mt-4">
        <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-stretch">
          <div className="flex flex-col justify-between gap-4 @2xl:w-[26rem] @2xl:shrink-0">
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-500/30 dark:bg-blue-500/5">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{tAbove("resultTitle")}</p>
              <p className="break-all font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-50" data-testid="converted-amount">
                <span dir="ltr">
                  {resultText} <span className="text-lg font-semibold text-zinc-500 dark:text-zinc-400">{T}</span>
                </span>
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-blue-700 dark:text-blue-300" data-testid="converted-fiat">
                <span dir="ltr">≈ {f.money(usdValue)}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{updated}</span>
                <div className="flex items-center gap-2">
                  <CopyButton text={summaryText} />
                  <ShareExportModal
                    namespace="tools.forex-converter"
                    operationLabel={`${F} → ${T}`}
                    inputRows={[{ label: F, value: `${amountText} ${F}` }]}
                    resultRows={[
                      { label: T, value: summaryText },
                      { label: `1 ${F}`, value: `${f.rate(rate)} ${T}` },
                      { label: `1 ${T}`, value: `${f.rate(1 / rate)} ${F}` },
                    ]}
                    heroLabel={T}
                    heroValue={summaryText}
                    sentence={`${amountText} ${F} = ${summaryText} (${updated}).`}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
              <CurrencyNode currency={fromCurrency} other={toCurrency} recent={recent} amountLabel={`${f.num(amt, 2)} ${F}`} digitStyle={digitStyle} />
              {/* Flow arrow with the rate on its shaft; marching dashes show money moving the reading way (RTL too). */}
              <div className="flex flex-col items-center gap-1" aria-hidden>
                <div dir="ltr" className="rounded-full bg-blue-600 px-2 py-0.5 font-mono text-[10px] font-semibold text-white shadow-sm" data-testid="flow-rate">
                  × {f.rate(rate)}
                </div>
                <div className="flex items-center">
                  <div className="flow-shaft h-1 w-6 animate-flow-dash rounded" />
                  <div className="h-0 w-0 border-y-[7px] border-s-[9px] border-y-transparent border-s-blue-500" />
                </div>
              </div>
              <CurrencyNode currency={toCurrency} other={fromCurrency} recent={recent} amountLabel={summaryText} digitStyle={digitStyle} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <WorkedExampleNote
              title={t("workedTitle")}
              rows={[
                { label: t("rowAmount"), value: `${f.num(amt, 2)} ${F}` },
                { label: t("rowFromRate", { code: F }), value: `÷ ${f.rate(fromCurrency.ratePerUsd)}` },
                { label: t("rowUsd"), value: `= ${f.num(usdValue, 4)} USD` },
                { label: t("rowToRate", { code: T }), value: `× ${f.rate(toCurrency.ratePerUsd)}` },
                { label: t("rowRate"), value: `1 ${F} = ${f.rate(rate)} ${T}` },
                { label: t("rowResult"), value: summaryText, emphasize: true, note: t("dailyNote") },
              ]}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
