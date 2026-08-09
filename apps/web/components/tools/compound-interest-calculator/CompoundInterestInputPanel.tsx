"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { CompoundingFrequency } from "./types";

type CompoundInterestInputPanelProps = {
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
};

const FREQUENCIES: CompoundingFrequency[] = ["annually", "semiannually", "quarterly", "monthly", "daily"];

export default function CompoundInterestInputPanel({
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
}: CompoundInterestInputPanelProps) {
  const t = useTranslations("tools.compound-interest-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <div className="space-y-5">
        <ToolInput
          label={t("form.principalLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.principalPlaceholder")}
          value={principal}
          onChange={(e) => onPrincipalChange(e.target.value)}
        />

        <ToolInput
          label={t("form.rateLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.ratePlaceholder")}
          value={rate}
          onChange={(e) => onRateChange(e.target.value)}
        />

        <ToolInput
          label={t("form.yearsLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.yearsPlaceholder")}
          value={years}
          onChange={(e) => onYearsChange(e.target.value)}
        />

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

        <ToolInput
          label={t("form.monthlyContributionLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.monthlyContributionPlaceholder")}
          value={monthlyContribution}
          onChange={(e) => onMonthlyContributionChange(e.target.value)}
        />
      </div>
    </SectionCard>
  );
}
