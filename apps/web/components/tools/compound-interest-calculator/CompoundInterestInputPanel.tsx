"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import type { CompoundingFrequency, SolveMode } from "./types";

type CompoundInterestInputPanelProps = {
  mode: SolveMode;
  principal: string;
  onPrincipalChange: (value: string) => void;
  rate: string;
  onRateChange: (value: string) => void;
  years: string;
  onYearsChange: (value: string) => void;
  frequency: CompoundingFrequency;
  onFrequencyChange: (value: CompoundingFrequency) => void;
  monthlyContribution: string;
  onMonthlyContributionChange: (value: string) => void;
  targetAmount: string;
  onTargetAmountChange: (value: string) => void;
  taxRate: string;
  onTaxRateChange: (value: string) => void;
  inflationRate: string;
  onInflationRateChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

const FREQUENCIES: CompoundingFrequency[] = ["annually", "semiannually", "quarterly", "monthly", "daily"];

export default function CompoundInterestInputPanel({
  mode,
  principal,
  onPrincipalChange,
  rate,
  onRateChange,
  years,
  onYearsChange,
  frequency,
  onFrequencyChange,
  monthlyContribution,
  onMonthlyContributionChange,
  targetAmount,
  onTargetAmountChange,
  taxRate,
  onTaxRateChange,
  inflationRate,
  onInflationRateChange,
  onCalculate,
  onClear,
}: CompoundInterestInputPanelProps) {
  const t = useTranslations("tools.compound-interest-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
        {mode !== "endAmount" && (
          <ToolInput
            label={t("form.targetLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.targetPlaceholder")}
            value={targetAmount}
            onChange={(e) => onTargetAmountChange(e.target.value)}
          />
        )}

        {mode !== "startingAmount" && (
          <ToolInput
            label={t("form.principalLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.principalPlaceholder")}
            value={principal}
            onChange={(e) => onPrincipalChange(e.target.value)}
          />
        )}

        {mode !== "returnRate" && (
          <ToolInput
            label={t("form.rateLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.ratePlaceholder")}
            value={rate}
            onChange={(e) => onRateChange(e.target.value)}
          />
        )}

        {mode !== "investmentLength" && (
          <ToolInput
            label={t("form.yearsLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.yearsPlaceholder")}
            value={years}
            onChange={(e) => onYearsChange(e.target.value)}
          />
        )}

        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("form.frequencyLabel")}</span>
          <select
            value={frequency}
            onChange={(e) => onFrequencyChange(e.target.value as CompoundingFrequency)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          >
            {FREQUENCIES.map((value) => (
              <option key={value} value={value}>
                {t(`form.frequency.${value}`)}
              </option>
            ))}
          </select>
        </label>

        {mode !== "additionalContribution" && (
          <ToolInput
            label={t("form.monthlyContributionLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.monthlyContributionPlaceholder")}
            value={monthlyContribution}
            onChange={(e) => onMonthlyContributionChange(e.target.value)}
          />
        )}

        {mode === "endAmount" && (
          <>
            <ToolInput
              label={t("form.taxRateLabel")}
              type="text"
              inputMode="decimal"
              placeholder={t("form.taxRatePlaceholder")}
              value={taxRate}
              onChange={(e) => onTaxRateChange(e.target.value)}
            />

            <ToolInput
              label={t("form.inflationRateLabel")}
              type="text"
              inputMode="decimal"
              placeholder={t("form.inflationRatePlaceholder")}
              value={inflationRate}
              onChange={(e) => onInflationRateChange(e.target.value)}
            />
          </>
        )}

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("form.calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("form.clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
