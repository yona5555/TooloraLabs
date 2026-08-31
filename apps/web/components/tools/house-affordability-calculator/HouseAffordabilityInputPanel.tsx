"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";
import type { HouseAffordabilityMode } from "./types";

type HouseAffordabilityInputPanelProps = {
  mode: HouseAffordabilityMode;
  currency: CurrencyCode;
  onCurrencyChange: (value: CurrencyCode) => void;

  annualIncome: string;
  onAnnualIncomeChange: (value: string) => void;
  targetHomePrice: string;
  onTargetHomePriceChange: (value: string) => void;
  monthlyDebts: string;
  onMonthlyDebtsChange: (value: string) => void;
  downPayment: string;
  onDownPaymentChange: (value: string) => void;
  interestRate: string;
  onInterestRateChange: (value: string) => void;
  loanTermYears: string;
  onLoanTermYearsChange: (value: string) => void;
  propertyTaxRate: string;
  onPropertyTaxRateChange: (value: string) => void;
  annualHomeInsurance: string;
  onAnnualHomeInsuranceChange: (value: string) => void;
  monthlyHOA: string;
  onMonthlyHOAChange: (value: string) => void;

  carAnnualIncome: string;
  onCarAnnualIncomeChange: (value: string) => void;
  carMonthlyDebts: string;
  onCarMonthlyDebtsChange: (value: string) => void;
  carDownPayment: string;
  onCarDownPaymentChange: (value: string) => void;
  carInterestRate: string;
  onCarInterestRateChange: (value: string) => void;
  carLoanTermYears: string;
  onCarLoanTermYearsChange: (value: string) => void;

  personalAnnualIncome: string;
  onPersonalAnnualIncomeChange: (value: string) => void;
  personalMonthlyDebts: string;
  onPersonalMonthlyDebtsChange: (value: string) => void;
  personalInterestRate: string;
  onPersonalInterestRateChange: (value: string) => void;
  personalLoanTermYears: string;
  onPersonalLoanTermYearsChange: (value: string) => void;

  businessMonthlyRevenue: string;
  onBusinessMonthlyRevenueChange: (value: string) => void;
  businessExistingDebt: string;
  onBusinessExistingDebtChange: (value: string) => void;
  businessInterestRate: string;
  onBusinessInterestRateChange: (value: string) => void;
  businessLoanTermYears: string;
  onBusinessLoanTermYearsChange: (value: string) => void;

  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function HouseAffordabilityInputPanel({
  mode,
  currency,
  onCurrencyChange,
  annualIncome,
  onAnnualIncomeChange,
  targetHomePrice,
  onTargetHomePriceChange,
  monthlyDebts,
  onMonthlyDebtsChange,
  downPayment,
  onDownPaymentChange,
  interestRate,
  onInterestRateChange,
  loanTermYears,
  onLoanTermYearsChange,
  propertyTaxRate,
  onPropertyTaxRateChange,
  annualHomeInsurance,
  onAnnualHomeInsuranceChange,
  monthlyHOA,
  onMonthlyHOAChange,
  carAnnualIncome,
  onCarAnnualIncomeChange,
  carMonthlyDebts,
  onCarMonthlyDebtsChange,
  carDownPayment,
  onCarDownPaymentChange,
  carInterestRate,
  onCarInterestRateChange,
  carLoanTermYears,
  onCarLoanTermYearsChange,
  personalAnnualIncome,
  onPersonalAnnualIncomeChange,
  personalMonthlyDebts,
  onPersonalMonthlyDebtsChange,
  personalInterestRate,
  onPersonalInterestRateChange,
  personalLoanTermYears,
  onPersonalLoanTermYearsChange,
  businessMonthlyRevenue,
  onBusinessMonthlyRevenueChange,
  businessExistingDebt,
  onBusinessExistingDebtChange,
  businessInterestRate,
  onBusinessInterestRateChange,
  businessLoanTermYears,
  onBusinessLoanTermYearsChange,
  onCalculate,
  onClear,
}: HouseAffordabilityInputPanelProps) {
  const t = useTranslations("tools.house-affordability-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />

        {(mode === "homePrice" || mode === "requiredIncome") && (
          <>
            {mode === "homePrice" ? (
              <div className="grid grid-cols-2 gap-4">
                <ToolInput
                  label={`${t("form.annualIncomeLabel")} (${currency})`}
                  type="text"
                  inputMode="decimal"
                  placeholder={t("form.annualIncomePlaceholder")}
                  value={annualIncome}
                  onChange={(e) => onAnnualIncomeChange(e.target.value)}
                />
                <ToolInput
                  label={`${t("form.monthlyDebtsLabel")} (${currency})`}
                  hint={t("form.monthlyDebtsHint")}
                  type="text"
                  inputMode="decimal"
                  placeholder={t("form.monthlyDebtsPlaceholder")}
                  value={monthlyDebts}
                  onChange={(e) => onMonthlyDebtsChange(e.target.value)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <ToolInput
                  label={`${t("form.targetHomePriceLabel")} (${currency})`}
                  type="text"
                  inputMode="decimal"
                  placeholder={t("form.targetHomePricePlaceholder")}
                  value={targetHomePrice}
                  onChange={(e) => onTargetHomePriceChange(e.target.value)}
                />
                <ToolInput
                  label={`${t("form.monthlyDebtsLabel")} (${currency})`}
                  hint={t("form.monthlyDebtsHint")}
                  type="text"
                  inputMode="decimal"
                  placeholder={t("form.monthlyDebtsPlaceholder")}
                  value={monthlyDebts}
                  onChange={(e) => onMonthlyDebtsChange(e.target.value)}
                />
              </div>
            )}

            <ToolInput
              label={`${t("form.downPaymentLabel")} (${currency})`}
              type="text"
              inputMode="decimal"
              placeholder={t("form.downPaymentPlaceholder")}
              value={downPayment}
              onChange={(e) => onDownPaymentChange(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
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
                inputMode="numeric"
                placeholder={t("form.loanTermPlaceholder")}
                value={loanTermYears}
                onChange={(e) => onLoanTermYearsChange(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ToolInput
                label={t("form.propertyTaxRateLabel")}
                hint={t("form.propertyTaxRateHint")}
                type="text"
                inputMode="decimal"
                placeholder={t("form.propertyTaxRatePlaceholder")}
                value={propertyTaxRate}
                onChange={(e) => onPropertyTaxRateChange(e.target.value)}
              />
              <ToolInput
                label={`${t("form.annualHomeInsuranceLabel")} (${currency})`}
                type="text"
                inputMode="decimal"
                placeholder={t("form.annualHomeInsurancePlaceholder")}
                value={annualHomeInsurance}
                onChange={(e) => onAnnualHomeInsuranceChange(e.target.value)}
              />
            </div>

            <ToolInput
              label={`${t("form.monthlyHOALabel")} (${currency})`}
              hint={t("form.monthlyHOAHint")}
              type="text"
              inputMode="decimal"
              placeholder={t("form.monthlyHOAPlaceholder")}
              value={monthlyHOA}
              onChange={(e) => onMonthlyHOAChange(e.target.value)}
            />
          </>
        )}

        {mode === "car" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ToolInput
                label={`${t("form.annualIncomeLabel")} (${currency})`}
                type="text"
                inputMode="decimal"
                placeholder={t("form.annualIncomePlaceholder")}
                value={carAnnualIncome}
                onChange={(e) => onCarAnnualIncomeChange(e.target.value)}
              />
              <ToolInput
                label={`${t("form.monthlyDebtsLabel")} (${currency})`}
                hint={t("form.monthlyDebtsHint")}
                type="text"
                inputMode="decimal"
                placeholder={t("form.monthlyDebtsPlaceholder")}
                value={carMonthlyDebts}
                onChange={(e) => onCarMonthlyDebtsChange(e.target.value)}
              />
            </div>
            <ToolInput
              label={`${t("form.downPaymentLabel")} (${currency})`}
              hint={t("form.carDownPaymentHint")}
              type="text"
              inputMode="decimal"
              placeholder={t("form.carDownPaymentPlaceholder")}
              value={carDownPayment}
              onChange={(e) => onCarDownPaymentChange(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <ToolInput
                label={t("form.interestRateLabel")}
                type="text"
                inputMode="decimal"
                placeholder={t("form.carInterestRatePlaceholder")}
                value={carInterestRate}
                onChange={(e) => onCarInterestRateChange(e.target.value)}
              />
              <ToolInput
                label={t("form.loanTermLabel")}
                hint={t("form.carLoanTermHint")}
                type="text"
                inputMode="numeric"
                placeholder={t("form.carLoanTermPlaceholder")}
                value={carLoanTermYears}
                onChange={(e) => onCarLoanTermYearsChange(e.target.value)}
              />
            </div>
          </>
        )}

        {mode === "personal" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ToolInput
                label={`${t("form.annualIncomeLabel")} (${currency})`}
                type="text"
                inputMode="decimal"
                placeholder={t("form.annualIncomePlaceholder")}
                value={personalAnnualIncome}
                onChange={(e) => onPersonalAnnualIncomeChange(e.target.value)}
              />
              <ToolInput
                label={`${t("form.monthlyDebtsLabel")} (${currency})`}
                hint={t("form.monthlyDebtsHint")}
                type="text"
                inputMode="decimal"
                placeholder={t("form.monthlyDebtsPlaceholder")}
                value={personalMonthlyDebts}
                onChange={(e) => onPersonalMonthlyDebtsChange(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ToolInput
                label={t("form.interestRateLabel")}
                hint={t("form.personalInterestRateHint")}
                type="text"
                inputMode="decimal"
                placeholder={t("form.personalInterestRatePlaceholder")}
                value={personalInterestRate}
                onChange={(e) => onPersonalInterestRateChange(e.target.value)}
              />
              <ToolInput
                label={t("form.loanTermLabel")}
                type="text"
                inputMode="numeric"
                placeholder={t("form.personalLoanTermPlaceholder")}
                value={personalLoanTermYears}
                onChange={(e) => onPersonalLoanTermYearsChange(e.target.value)}
              />
            </div>
          </>
        )}

        {mode === "business" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ToolInput
                label={`${t("form.businessMonthlyRevenueLabel")} (${currency})`}
                hint={t("form.businessMonthlyRevenueHint")}
                type="text"
                inputMode="decimal"
                placeholder={t("form.businessMonthlyRevenuePlaceholder")}
                value={businessMonthlyRevenue}
                onChange={(e) => onBusinessMonthlyRevenueChange(e.target.value)}
              />
              <ToolInput
                label={`${t("form.businessExistingDebtLabel")} (${currency})`}
                type="text"
                inputMode="decimal"
                placeholder={t("form.businessExistingDebtPlaceholder")}
                value={businessExistingDebt}
                onChange={(e) => onBusinessExistingDebtChange(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ToolInput
                label={t("form.interestRateLabel")}
                type="text"
                inputMode="decimal"
                placeholder={t("form.businessInterestRatePlaceholder")}
                value={businessInterestRate}
                onChange={(e) => onBusinessInterestRateChange(e.target.value)}
              />
              <ToolInput
                label={t("form.loanTermLabel")}
                type="text"
                inputMode="numeric"
                placeholder={t("form.businessLoanTermPlaceholder")}
                value={businessLoanTermYears}
                onChange={(e) => onBusinessLoanTermYearsChange(e.target.value)}
              />
            </div>
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
