"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import PdfDownloadButton from "@/components/tool-ui/PdfDownloadButton";
import type { RetirementResult as RetirementResultData } from "@tooloralabs/tools";

type RetirementResultProps = {
  result: RetirementResultData | null;
  currentSavings: number;
  monthlyContribution: number;
  annualReturnRate: number;
  digitStyle: DigitStyle;
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
  result,
  currentSavings,
  monthlyContribution,
  annualReturnRate,
  digitStyle,
}: RetirementResultProps) {
  const t = useTranslations("tools.retirement-calculator");

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const hasResult = result !== null && result.projectedBalance > 0;

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        hasResult ? (
          <PdfDownloadButton
            toolName={t("title")}
            inputs={[
              { label: t("form.currentSavingsLabel"), value: money(currentSavings) },
              { label: t("form.monthlyContributionLabel"), value: money(monthlyContribution) },
              { label: t("form.annualReturnRateLabel"), value: `${formatLocalizedNumber(annualReturnRate, digitStyle)}%` },
              { label: t("aboveFold.yearsToRetirementLabel"), value: String(result.yearsToRetirement) },
            ]}
            results={[
              { label: t("aboveFold.projectedBalanceLabel"), value: money(result.projectedBalance) },
              { label: t("aboveFold.totalContributionsLabel"), value: money(result.totalContributions) },
              { label: t("aboveFold.totalGrowthLabel"), value: money(result.totalGrowth) },
            ]}
            filename="retirement-calculator-result.pdf"
          />
        ) : undefined
      }
    >
      {hasResult ? (
        <>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.projectedBalanceLabel")}</p>
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {money(result.projectedBalance)}
          </p>
          <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {t("aboveFold.yearsToRetirementValue", { years: result.yearsToRetirement })}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat title={t("aboveFold.totalContributionsLabel")} value={money(result.totalContributions)} />
            <Stat title={t("aboveFold.totalGrowthLabel")} value={money(result.totalGrowth)} />
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
