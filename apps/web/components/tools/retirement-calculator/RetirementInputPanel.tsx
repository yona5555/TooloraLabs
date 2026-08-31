"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";
import type { RetirementMode } from "./types";

type RetirementInputPanelProps = {
  mode: RetirementMode;
  currency: CurrencyCode;
  onCurrencyChange: (value: CurrencyCode) => void;
  currentAge: string;
  onCurrentAgeChange: (value: string) => void;
  retirementAge: string;
  onRetirementAgeChange: (value: string) => void;
  targetBalance: string;
  onTargetBalanceChange: (value: string) => void;
  currentSavings: string;
  onCurrentSavingsChange: (value: string) => void;
  monthlyContribution: string;
  onMonthlyContributionChange: (value: string) => void;
  annualReturnRate: string;
  onAnnualReturnRateChange: (value: string) => void;
  inflationRate: string;
  onInflationRateChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function RetirementInputPanel({
  mode,
  currency,
  onCurrencyChange,
  currentAge,
  onCurrentAgeChange,
  retirementAge,
  onRetirementAgeChange,
  targetBalance,
  onTargetBalanceChange,
  currentSavings,
  onCurrentSavingsChange,
  monthlyContribution,
  onMonthlyContributionChange,
  annualReturnRate,
  onAnnualReturnRateChange,
  inflationRate,
  onInflationRateChange,
  onCalculate,
  onClear,
}: RetirementInputPanelProps) {
  const t = useTranslations("tools.retirement-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />

        {mode !== "endAmount" && (
          <ToolInput
            label={`${t("form.targetBalanceLabel")} (${currency})`}
            hint={t("form.targetBalanceHint")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.targetBalancePlaceholder")}
            value={targetBalance}
            onChange={(e) => onTargetBalanceChange(e.target.value)}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <ToolInput
            label={t("form.currentAgeLabel")}
            type="text"
            inputMode="numeric"
            placeholder={t("form.currentAgePlaceholder")}
            value={currentAge}
            onChange={(e) => onCurrentAgeChange(e.target.value)}
          />
          {mode !== "requiredYears" && (
            <ToolInput
              label={t("form.retirementAgeLabel")}
              type="text"
              inputMode="numeric"
              placeholder={t("form.retirementAgePlaceholder")}
              value={retirementAge}
              onChange={(e) => onRetirementAgeChange(e.target.value)}
            />
          )}
        </div>

        <ToolInput
          label={`${t("form.currentSavingsLabel")} (${currency})`}
          type="text"
          inputMode="decimal"
          placeholder={t("form.currentSavingsPlaceholder")}
          value={currentSavings}
          onChange={(e) => onCurrentSavingsChange(e.target.value)}
        />

        {mode !== "requiredContribution" && (
          <ToolInput
            label={`${t("form.monthlyContributionLabel")} (${currency})`}
            type="text"
            inputMode="decimal"
            placeholder={t("form.monthlyContributionPlaceholder")}
            value={monthlyContribution}
            onChange={(e) => onMonthlyContributionChange(e.target.value)}
          />
        )}

        <ToolInput
          label={t("form.annualReturnRateLabel")}
          hint={t("form.annualReturnRateHint")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.annualReturnRatePlaceholder")}
          value={annualReturnRate}
          onChange={(e) => onAnnualReturnRateChange(e.target.value)}
        />

        {mode === "endAmount" && (
          <ToolInput
            label={t("form.inflationRateLabel")}
            hint={t("form.inflationRateHint")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.inflationRatePlaceholder")}
            value={inflationRate}
            onChange={(e) => onInflationRateChange(e.target.value)}
          />
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
