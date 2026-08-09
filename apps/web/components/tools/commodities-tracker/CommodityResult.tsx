"use client";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateMetalValue } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import DataSourceNote from "./DataSourceNote";
import type { CommodityId, DisplayCurrency } from "./types";

type CommodityResultProps = {
  commodity: CommodityId;
  convertedValue: number;
  goldUsdPerOunce: number;
  silverUsdPerOunce: number;
  wtiUsdPerBarrel: number;
  currency: DisplayCurrency;
  onCurrencyChange: (currency: DisplayCurrency) => void;
  usdToSarRate: number;
  lastUpdatedUnix: number;
  digitStyle: DigitStyle;
};

export default function CommodityResult({
  commodity,
  convertedValue,
  goldUsdPerOunce,
  silverUsdPerOunce,
  wtiUsdPerBarrel,
  currency,
  onCurrencyChange,
  usdToSarRate,
  lastUpdatedUnix,
  digitStyle,
}: CommodityResultProps) {
  const t = useTranslations("tools.commodities-tracker.aboveFold");
  const locale = useLocale();
  const fxRate = currency === "sar" ? usdToSarRate : 1;
  const currencyCode = currency === "sar" ? "SAR" : "USD";

  const updatedLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    numberingSystem: digitStyle === "eastern" ? "arab" : "latn",
  }).format(new Date(lastUpdatedUnix * 1000));

  const resultText = formatLocalizedNumber(convertedValue, digitStyle, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: convertedValue < 1 ? 4 : 2,
  });

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: currencyCode, maximumFractionDigits: 2 });

  const goldPerGram = money(calculateMetalValue(1, "gram", goldUsdPerOunce, fxRate));
  const silverPerGram = money(calculateMetalValue(1, "gram", silverUsdPerOunce, fxRate));
  const goldPerOunce = money(goldUsdPerOunce * fxRate);
  const oilPerBarrel = money(wtiUsdPerBarrel * fxRate);

  return (
    <SectionCard title={t("resultTitle")} action={<CopyButton text={resultText} />}>
      <div className="text-center">
        <p dir="ltr" className="break-all font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {resultText}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>{t("lastUpdated", { time: updatedLabel })}</span>
        <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          {(["usd", "sar"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCurrencyChange(c)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition ${
                currency === c
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-3 ${commodity === "gold" ? "bg-blue-50 dark:bg-blue-500/10" : "bg-zinc-50 dark:bg-zinc-800/60"}`}>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("goldPerGramLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {goldPerGram}
          </dd>
        </div>
        <div className={`rounded-xl p-3 ${commodity === "silver" ? "bg-blue-50 dark:bg-blue-500/10" : "bg-zinc-50 dark:bg-zinc-800/60"}`}>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("silverPerGramLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {silverPerGram}
          </dd>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("goldPerOunceLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {goldPerOunce}
          </dd>
        </div>
        <div className={`rounded-xl p-3 ${commodity === "oil" ? "bg-blue-50 dark:bg-blue-500/10" : "bg-zinc-50 dark:bg-zinc-800/60"}`}>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("oilPerBarrelLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {oilPerBarrel}
          </dd>
        </div>
      </dl>

      <div className="mt-4 space-y-1">
        <DataSourceNote sourceKey="metalpriceApi" />
        <DataSourceNote sourceKey="oilpriceApi" />
      </div>
    </SectionCard>
  );
}
