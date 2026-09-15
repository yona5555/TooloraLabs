"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { calculateCompoundInterest, type CompoundingFrequency } from "@tooloralabs/tools";
import { useCompoundInterestLiveInputs } from "./CompoundInterestLiveInputsContext";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const FREQUENCIES: CompoundingFrequency[] = ["annually", "semiannually", "quarterly", "monthly", "daily"];

/**
 * Live comparison of the same principal/rate/years/contribution combo at every
 * supported compounding frequency — directly answers "does compounding
 * frequency actually matter?" by showing the (small but real) future-value
 * gap between annual and daily compounding for the visitor's own numbers,
 * rather than a generic illustrative example.
 */
export default function CompoundInterestFrequencyDiagram() {
  const t = useTranslations("tools.compound-interest-calculator.education.frequencyDiagram");
  const live = useCompoundInterestLiveInputs();

  const principal = live?.principal ?? 10000;
  const rate = live?.rate ?? 7;
  const years = live?.years ?? 10;
  const contribution = live?.monthlyContribution ?? 0;
  const currency = live?.currency ?? "USD";
  const digitStyle = live?.digitStyle ?? "western";

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });

  const results = FREQUENCIES.map((freq) => ({
    freq,
    futureValue: calculateCompoundInterest(principal, rate, years, freq, contribution).futureValue,
  }));

  const maxValue = Math.max(...results.map((r) => r.futureValue), 1);
  const minValue = Math.min(...results.map((r) => r.futureValue));

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-3 text-sm opacity-80">{t("intro", { years, rate: formatLocalizedNumber(rate, digitStyle, { maximumFractionDigits: 2 }) })}</p>
      <div dir="ltr" className="flex flex-col gap-2">
        {results.map((r) => {
          const widthPercent = (r.futureValue / maxValue) * 100;
          const isMax = r.futureValue === maxValue;
          return (
            <div key={r.freq} className="flex items-center gap-2 text-xs">
              <span className="w-24 shrink-0 text-zinc-600 dark:text-zinc-400">{t(`frequencies.${r.freq}`)}</span>
              <div className="h-5 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={isMax ? "h-full rounded bg-emerald-500" : "h-full rounded bg-blue-400 dark:bg-blue-500"}
                  style={{ width: `${Math.max(widthPercent, 4)}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-end font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {money(r.futureValue)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs opacity-70">
        {t("gap", { amount: money(maxValue - minValue) })}
      </p>
    </EncyclopediaLiveWidget>
  );
}
