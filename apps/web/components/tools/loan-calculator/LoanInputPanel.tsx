"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { LoanType } from "./types";

type LoanInputPanelProps = {
  loanType: LoanType;
  onLoanTypeChange: (type: LoanType) => void;
  loanAmount: string;
  onLoanAmountChange: (value: string) => void;
  interestRate: string;
  onInterestRateChange: (value: string) => void;
  loanTermYears: string;
  onLoanTermYearsChange: (value: string) => void;
};

export default function LoanInputPanel({
  loanType,
  onLoanTypeChange,
  loanAmount,
  onLoanAmountChange,
  interestRate,
  onInterestRateChange,
  loanTermYears,
  onLoanTermYearsChange,
}: LoanInputPanelProps) {
  const t = useTranslations("tools.loan-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        {(["auto", "personal"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onLoanTypeChange(type)}
            className={`rounded-md px-3 py-3 text-sm font-medium transition ${
              loanType === type
                ? "bg-blue-600 text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {type === "auto" ? t("form.typeAuto") : t("form.typePersonal")}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        <ToolInput
          label={t("form.loanAmountLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.loanAmountPlaceholder")}
          value={loanAmount}
          onChange={(e) => onLoanAmountChange(e.target.value)}
        />

        <ToolInput
          label={t("form.interestRateLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.interestRatePlaceholder")}
          value={interestRate}
          onChange={(e) => onInterestRateChange(e.target.value)}
        />

        <ToolInput
          label={t("form.loanTermLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.loanTermPlaceholder")}
          value={loanTermYears}
          onChange={(e) => onLoanTermYearsChange(e.target.value)}
        />
      </div>
    </SectionCard>
  );
}
