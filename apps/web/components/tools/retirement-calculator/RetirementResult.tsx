"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RetirementBreakdownDonut from "./RetirementBreakdownDonut";
import RetirementShareExportModal from "./RetirementShareExportModal";
import type { CurrencyCode } from "@/lib/currency";
import type { RetirementMode, RetirementOutcome } from "./types";

type RetirementResultProps = {
  mode: RetirementMode;
  currency: CurrencyCode;
  hasCalculated: boolean;
  digitStyle: DigitStyle;
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturnRate: number;
  targetBalance: number;
  inflationRate: number;
  outcome: RetirementOutcome;
};

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5 text-center dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{title}</dt>
      <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export default function RetirementResult({
  mode,
  currency,
  hasCalculated,
  digitStyle,
  currentAge,
  retirementAge,
  currentSavings,
  monthlyContribution,
  annualReturnRate,
  targetBalance,
  inflationRate,
  outcome,
}: RetirementResultProps) {
  const t = useTranslations("tools.retirement-calculator");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });
  const percent = (value: number) => `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 })}%`;
  const yearsText = (value: number) => `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 })} ${t("aboveFold.yearsUnit")}`;

  if (!hasCalculated) {
    return (
      <SectionCard title={t("aboveFold.resultTitle")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  const heroLabel =
    mode === "endAmount" ? t("aboveFold.projectedBalanceLabel") : mode === "requiredContribution" ? t("aboveFold.requiredContributionLabel") : t("aboveFold.yearsNeededLabel");

  const heroValue = outcome.unreachable
    ? "—"
    : mode === "endAmount"
      ? money(outcome.projectedBalance)
      : mode === "requiredContribution"
        ? money(outcome.requiredMonthlyContribution)
        : yearsText(outcome.yearsToRetirement);

  const sentenceKey = outcome.unreachable ? "aboveFold.sentences.requiredYearsUnreachable" : `aboveFold.sentences.${mode}`;
  const sentence = t(sentenceKey, {
    currentAge: formatLocalizedNumber(currentAge, digitStyle, { maximumFractionDigits: 0 }),
    retirementAge: formatLocalizedNumber(retirementAge, digitStyle, { maximumFractionDigits: 0 }),
    savings: money(currentSavings),
    contribution: money(monthlyContribution),
    rate: percent(annualReturnRate),
    target: money(targetBalance),
    balance: money(outcome.projectedBalance),
    requiredContribution: money(outcome.requiredMonthlyContribution),
    years: yearsText(outcome.yearsToRetirement),
    retirementAgeReached: formatLocalizedNumber(outcome.retirementAgeReached ?? 0, digitStyle, { maximumFractionDigits: 0 }),
  });

  const sharedInputRows = [
    { label: t("form.currentAgeLabel"), value: formatLocalizedNumber(currentAge, digitStyle, { maximumFractionDigits: 0 }) },
    { label: t("form.currentSavingsLabel"), value: money(currentSavings) },
    { label: t("form.annualReturnRateLabel"), value: percent(annualReturnRate) },
  ];
  const inputRows =
    mode === "endAmount"
      ? [{ label: t("form.retirementAgeLabel"), value: formatLocalizedNumber(retirementAge, digitStyle, { maximumFractionDigits: 0 }) }, ...sharedInputRows, { label: t("form.monthlyContributionLabel"), value: money(monthlyContribution) }]
      : mode === "requiredContribution"
        ? [
            { label: t("form.targetBalanceLabel"), value: money(targetBalance) },
            { label: t("form.retirementAgeLabel"), value: formatLocalizedNumber(retirementAge, digitStyle, { maximumFractionDigits: 0 }) },
            ...sharedInputRows,
          ]
        : [{ label: t("form.targetBalanceLabel"), value: money(targetBalance) }, ...sharedInputRows, { label: t("form.monthlyContributionLabel"), value: money(monthlyContribution) }];

  const showInflation = mode === "endAmount" && inflationRate > 0 && !outcome.unreachable;

  const resultRows = outcome.unreachable
    ? [{ label: heroLabel, value: "—" }]
    : mode === "endAmount"
      ? [
          { label: t("aboveFold.totalContributedLabel"), value: money(outcome.totalContributionsPure) },
          { label: t("aboveFold.totalGrowthLabel"), value: money(outcome.totalGrowth) },
          ...(showInflation ? [{ label: t("aboveFold.inflationAdjustedBalanceLabel"), value: money(outcome.inflationAdjustedBalance) }] : []),
        ]
      : mode === "requiredContribution"
        ? [
            { label: t("aboveFold.projectedBalanceLabel"), value: money(outcome.projectedBalance) },
            { label: t("aboveFold.totalGrowthLabel"), value: money(outcome.totalGrowth) },
          ]
        : [
            { label: t("aboveFold.retirementAgeReachedLabel"), value: formatLocalizedNumber(outcome.retirementAgeReached ?? 0, digitStyle, { maximumFractionDigits: 0 }) },
            { label: t("aboveFold.projectedBalanceLabel"), value: money(outcome.projectedBalance) },
          ];

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        <RetirementShareExportModal
          mode={mode}
          currency={currency}
          inputRows={inputRows}
          resultRows={resultRows}
          heroLabel={heroLabel}
          heroValue={heroValue}
          sentence={sentence}
          yearlySchedule={outcome.yearlySchedule}
          columnYearLabel={t("yearlyBreakdown.columnYear")}
          columnBalanceLabel={t("yearlyBreakdown.columnEndingBalance")}
          columnInterestLabel={t("yearlyBreakdown.columnInterestEarned")}
          digitStyle={digitStyle}
        />
      }
    >
      <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">{sentence}</p>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{heroLabel}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {heroValue}
      </p>

      {showInflation && (
        <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {t("aboveFold.inflationAdjustedBalanceLabel")}:{" "}
          <span dir="ltr" className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
            {money(outcome.inflationAdjustedBalance)}
          </span>
        </p>
      )}

      {!outcome.unreachable && mode === "requiredYears" && outcome.retirementAgeReached !== null && (
        <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          {(() => {
            const reached = outcome.retirementAgeReached as number;
            const trackMax = Math.max(100, reached + 5);
            const trackSpan = Math.max(trackMax - currentAge, 1);
            const fillPct = Math.min(Math.max(((reached - currentAge) / trackSpan) * 100, 0), 100);
            const ageLabel = (age: number) => formatLocalizedNumber(age, digitStyle, { maximumFractionDigits: 0 });
            return (
              <>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.ageProgressLabel")}</p>
                <div dir="ltr" className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-blue-600 transition-all duration-700 ease-out dark:bg-blue-400" style={{ width: `${fillPct}%` }} />
                </div>
                <div dir="ltr" className="mt-1.5 flex justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                  <span>{t("aboveFold.ageProgressCurrent", { age: ageLabel(currentAge) })}</span>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">{t("aboveFold.ageProgressTarget", { age: ageLabel(reached) })}</span>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {!outcome.unreachable && (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {mode === "endAmount" && (
            <>
              <Stat title={t("aboveFold.totalContributedLabel")} value={money(outcome.totalContributionsPure)} />
              <Stat title={t("aboveFold.totalGrowthLabel")} value={money(outcome.totalGrowth)} />
              {showInflation && <Stat title={t("aboveFold.inflationAdjustedBalanceLabel")} value={money(outcome.inflationAdjustedBalance)} />}
            </>
          )}
          {mode === "requiredContribution" && (
            <>
              <Stat title={t("aboveFold.projectedBalanceLabel")} value={money(outcome.projectedBalance)} />
              <Stat title={t("aboveFold.totalGrowthLabel")} value={money(outcome.totalGrowth)} />
            </>
          )}
          {mode === "requiredYears" && (
            <>
              <Stat title={t("aboveFold.retirementAgeReachedLabel")} value={formatLocalizedNumber(outcome.retirementAgeReached ?? 0, digitStyle, { maximumFractionDigits: 0 })} />
              <Stat title={t("aboveFold.projectedBalanceLabel")} value={money(outcome.projectedBalance)} />
            </>
          )}
        </div>
      )}

      {!outcome.unreachable && (
        <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <RetirementBreakdownDonut
            centerValue={money(outcome.projectedBalance)}
            centerLabel={t("aboveFold.projectedBalanceLabel")}
            segments={[
              { key: "savings", value: currentSavings, label: t("form.currentSavingsLabel"), colorClass: "stroke-zinc-400 dark:stroke-zinc-600" },
              { key: "contributions", value: outcome.totalContributionsPure, label: t("aboveFold.totalContributedLabel"), colorClass: "stroke-blue-600 dark:stroke-blue-400" },
              { key: "growth", value: outcome.totalGrowth, label: t("aboveFold.totalGrowthLabel"), colorClass: "stroke-amber-400 dark:stroke-amber-500" },
            ]}
          />
        </div>
      )}
    </SectionCard>
  );
}
