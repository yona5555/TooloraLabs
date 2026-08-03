"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { DownPaymentMode } from "./types";

const LOAN_TERM_PRESETS = [15, 20, 30] as const;

type MortgageInputPanelProps = {
  homePrice: string;
  onHomePriceChange: (value: string) => void;

  downPaymentMode: DownPaymentMode;
  onDownPaymentModeChange: (mode: DownPaymentMode) => void;
  downPaymentAmount: string;
  onDownPaymentAmountChange: (value: string) => void;
  downPaymentPercent: string;
  onDownPaymentPercentChange: (value: string) => void;

  interestRate: string;
  onInterestRateChange: (value: string) => void;
  loanTermYears: string;
  onLoanTermYearsChange: (value: string) => void;

  propertyTax: string;
  onPropertyTaxChange: (value: string) => void;
  insurance: string;
  onInsuranceChange: (value: string) => void;
  hoa: string;
  onHoaChange: (value: string) => void;
  pmi: string;
  onPmiChange: (value: string) => void;
  extraMonthlyPayment: string;
  onExtraMonthlyPaymentChange: (value: string) => void;

  error: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export default function MortgageInputPanel({
  homePrice,
  onHomePriceChange,
  downPaymentMode,
  onDownPaymentModeChange,
  downPaymentAmount,
  onDownPaymentAmountChange,
  downPaymentPercent,
  onDownPaymentPercentChange,
  interestRate,
  onInterestRateChange,
  loanTermYears,
  onLoanTermYearsChange,
  propertyTax,
  onPropertyTaxChange,
  insurance,
  onInsuranceChange,
  hoa,
  onHoaChange,
  pmi,
  onPmiChange,
  extraMonthlyPayment,
  onExtraMonthlyPaymentChange,
  error,
  onSubmit,
  onReset,
}: MortgageInputPanelProps) {
  const t = useTranslations("tools.mortgage-calculator");
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <form onSubmit={onSubmit} className="space-y-5">
        <ToolInput
          label={t("form.homePrice")}
          type="text"
          inputMode="decimal"
          value={homePrice}
          onChange={(e) => onHomePriceChange(e.target.value)}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {t("form.downPayment")}
            </span>
            <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => onDownPaymentModeChange("percent")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  downPaymentMode === "percent"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {t("form.downPaymentPercentUnit")}
              </button>
              <button
                type="button"
                onClick={() => onDownPaymentModeChange("amount")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  downPaymentMode === "amount"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {t("form.downPaymentAmountUnit")}
              </button>
            </div>
          </div>
          {downPaymentMode === "percent" ? (
            <ToolInput
              type="text"
              inputMode="decimal"
              value={downPaymentPercent}
              onChange={(e) => onDownPaymentPercentChange(e.target.value)}
            />
          ) : (
            <ToolInput
              type="text"
              inputMode="decimal"
              value={downPaymentAmount}
              onChange={(e) => onDownPaymentAmountChange(e.target.value)}
            />
          )}
        </div>

        <ToolInput
          label={t("form.interestRate")}
          type="text"
          inputMode="decimal"
          value={interestRate}
          onChange={(e) => onInterestRateChange(e.target.value)}
        />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.loanTerm")}
          </span>
          <div className="flex gap-2">
            {LOAN_TERM_PRESETS.map((years) => (
              <button
                key={years}
                type="button"
                onClick={() => onLoanTermYearsChange(String(years))}
                className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition ${
                  loanTermYears === String(years)
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {t("form.loanTermPreset", { years })}
              </button>
            ))}
          </div>
          <ToolInput
            className="mt-2"
            type="text"
            inputMode="decimal"
            hint={t("form.loanTermCustomHint")}
            value={loanTermYears}
            onChange={(e) => onLoanTermYearsChange(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            aria-expanded={showAdvanced}
          >
            {t("form.advancedTitle")}
            <ChevronDown size={16} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </button>

          {showAdvanced && (
            <div className="space-y-4 border-t border-zinc-200 p-4 dark:border-zinc-800">
              <ToolInput
                label={t("form.propertyTax")}
                type="text"
                inputMode="decimal"
                value={propertyTax}
                onChange={(e) => onPropertyTaxChange(e.target.value)}
              />
              <ToolInput
                label={t("form.insurance")}
                type="text"
                inputMode="decimal"
                value={insurance}
                onChange={(e) => onInsuranceChange(e.target.value)}
              />
              <ToolInput
                label={t("form.hoa")}
                type="text"
                inputMode="decimal"
                value={hoa}
                onChange={(e) => onHoaChange(e.target.value)}
              />
              <ToolInput
                label={t("form.pmi")}
                hint={t("form.pmiHint")}
                type="text"
                inputMode="decimal"
                value={pmi}
                onChange={(e) => onPmiChange(e.target.value)}
              />
              <ToolInput
                label={t("form.extraMonthlyPayment")}
                hint={t("form.extraMonthlyPaymentHint")}
                type="text"
                inputMode="decimal"
                value={extraMonthlyPayment}
                onChange={(e) => onExtraMonthlyPaymentChange(e.target.value)}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("form.calculate")}</ToolButton>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("form.reset")}
          </button>
        </div>
      </form>
    </div>
  );
}
