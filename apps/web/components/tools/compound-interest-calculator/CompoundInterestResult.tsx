"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import CompoundInterestBreakdownDonut from "./CompoundInterestBreakdownDonut";

type CompoundInterestResultProps = {
  futureValue: number;
  principal: number;
  totalContributions: number;
  totalInterest: number;
  digitStyle: DigitStyle;
};

export default function CompoundInterestResult({
  futureValue,
  principal,
  totalContributions,
  totalInterest,
  digitStyle,
}: CompoundInterestResultProps) {
  const t = useTranslations("tools.compound-interest-calculator");

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.futureValueLabel")}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {currency(futureValue)}
      </p>

      <div className="mt-5">
        <CompoundInterestBreakdownDonut
          centerValue={currency(futureValue)}
          centerLabel={t("aboveFold.futureValueLabel")}
          segments={[
            { key: "principal", value: principal, label: t("aboveFold.principalLabel"), colorClass: "stroke-zinc-400 dark:stroke-zinc-600" },
            { key: "contributions", value: totalContributions, label: t("aboveFold.contributionsLabel"), colorClass: "stroke-blue-600 dark:stroke-blue-400" },
            { key: "interest", value: totalInterest, label: t("aboveFold.interestLabel"), colorClass: "stroke-amber-400 dark:stroke-amber-500" },
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-200 pt-5 text-center dark:border-zinc-800">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.principalLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {currency(principal)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.contributionsLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {currency(totalContributions)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.interestLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
            {currency(totalInterest)}
          </dd>
        </div>
      </div>
    </SectionCard>
  );
}
