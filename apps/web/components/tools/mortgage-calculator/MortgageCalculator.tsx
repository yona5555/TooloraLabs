"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MortgageCalculator as MortgageCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import MortgageInputPanel from "./MortgageInputPanel";
import MortgageResult from "./MortgageResult";
import MortgageAffordabilityMini from "./MortgageAffordabilityMini";
import MortgageRelatedSidebar from "./MortgageRelatedSidebar";
import MortgagePayoffChart from "./MortgagePayoffChart";
import MortgageEducation from "./MortgageEducation";
import type { DownPaymentMode, MortgageExtendedResult } from "./types";

const tool = new MortgageCalculatorTool();

const MAX_HOME_PRICE = 50_000_000;
const MAX_INTEREST_RATE = 25;
const MIN_LOAN_TERM_YEARS = 1;
const MAX_LOAN_TERM_YEARS = 50;

const DEFAULT_HOME_PRICE = 400_000;
const DEFAULT_DOWN_PAYMENT_PERCENT = 20;
const DEFAULT_INTEREST_RATE = 6.5;
const DEFAULT_LOAN_TERM_YEARS = 30;
const DEFAULT_PROPERTY_TAX = 4_800;
const DEFAULT_INSURANCE = 1_500;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function buildResult(
  homePrice: number,
  downPayment: number,
  annualInterestRate: number,
  loanTermYears: number,
  annualPropertyTax: number,
  annualHomeInsurance: number,
  monthlyHOA: number,
  monthlyPMI: number,
  extraMonthlyPayment: number
): MortgageExtendedResult {
  const output = tool.execute(
    {
      homePrice,
      downPayment,
      annualInterestRate,
      loanTermYears,
      annualPropertyTax,
      annualHomeInsurance,
      monthlyHOA,
      monthlyPMI,
      extraMonthlyPayment,
    },
    { locale: "en-US" }
  );
  return output.data;
}

const DEFAULT_DOWN_PAYMENT_AMOUNT = Math.round(DEFAULT_HOME_PRICE * (DEFAULT_DOWN_PAYMENT_PERCENT / 100));

export default function MortgageCalculator() {
  const t = useTranslations("tools.mortgage-calculator");

  const [homePrice, setHomePrice] = useState(String(DEFAULT_HOME_PRICE));
  const [downPaymentMode, setDownPaymentMode] = useState<DownPaymentMode>("percent");
  const [downPaymentAmount, setDownPaymentAmount] = useState(String(DEFAULT_DOWN_PAYMENT_AMOUNT));
  const [downPaymentPercent, setDownPaymentPercent] = useState(String(DEFAULT_DOWN_PAYMENT_PERCENT));
  const [interestRate, setInterestRate] = useState(String(DEFAULT_INTEREST_RATE));
  const [loanTermYears, setLoanTermYears] = useState(String(DEFAULT_LOAN_TERM_YEARS));
  const [propertyTax, setPropertyTax] = useState(String(DEFAULT_PROPERTY_TAX));
  const [insurance, setInsurance] = useState(String(DEFAULT_INSURANCE));
  const [hoa, setHoa] = useState("0");
  const [pmi, setPmi] = useState("0");
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState("0");

  const [error, setError] = useState("");
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<MortgageExtendedResult>(() =>
    buildResult(
      DEFAULT_HOME_PRICE,
      DEFAULT_DOWN_PAYMENT_AMOUNT,
      DEFAULT_INTEREST_RATE,
      DEFAULT_LOAN_TERM_YEARS,
      DEFAULT_PROPERTY_TAX,
      DEFAULT_INSURANCE,
      0,
      0,
      0
    )
  );

  function handleDownPaymentModeChange(next: DownPaymentMode) {
    if (next === downPaymentMode) return;

    const homePriceValue = parseLocalizedNumber(homePrice);

    if (next === "amount") {
      const percentValue = parseLocalizedNumber(downPaymentPercent);
      if (!Number.isNaN(homePriceValue) && !Number.isNaN(percentValue)) {
        setDownPaymentAmount(String(Math.round(homePriceValue * (percentValue / 100))));
      }
    } else {
      const amountValue = parseLocalizedNumber(downPaymentAmount);
      if (!Number.isNaN(homePriceValue) && homePriceValue > 0 && !Number.isNaN(amountValue)) {
        setDownPaymentPercent(String(round1((amountValue / homePriceValue) * 100)));
      }
    }

    setDownPaymentMode(next);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const homePriceValue = parseLocalizedNumber(homePrice);
    if (!homePrice || Number.isNaN(homePriceValue)) {
      setError(t("errors.required"));
      return;
    }
    if (homePriceValue <= 0 || homePriceValue > MAX_HOME_PRICE) {
      setError(t("errors.homePriceRange"));
      return;
    }

    const downPaymentValue =
      downPaymentMode === "percent"
        ? homePriceValue * (parseLocalizedNumber(downPaymentPercent) / 100)
        : parseLocalizedNumber(downPaymentAmount);
    if (Number.isNaN(downPaymentValue)) {
      setError(t("errors.required"));
      return;
    }
    if (downPaymentValue < 0 || downPaymentValue >= homePriceValue) {
      setError(t("errors.downPaymentRange"));
      return;
    }

    const interestRateValue = parseLocalizedNumber(interestRate);
    if (Number.isNaN(interestRateValue) || interestRateValue < 0 || interestRateValue > MAX_INTEREST_RATE) {
      setError(t("errors.interestRateRange"));
      return;
    }

    const loanTermValue = parseLocalizedNumber(loanTermYears);
    if (Number.isNaN(loanTermValue) || loanTermValue < MIN_LOAN_TERM_YEARS || loanTermValue > MAX_LOAN_TERM_YEARS) {
      setError(t("errors.loanTermRange"));
      return;
    }

    const propertyTaxValue = parseLocalizedNumber(propertyTax);
    const insuranceValue = parseLocalizedNumber(insurance);
    const hoaValue = parseLocalizedNumber(hoa);
    const pmiValue = parseLocalizedNumber(pmi);
    const extraValue = parseLocalizedNumber(extraMonthlyPayment);
    if (
      [propertyTaxValue, insuranceValue, hoaValue, pmiValue, extraValue].some(
        (value) => Number.isNaN(value) || value < 0
      )
    ) {
      setError(t("errors.negativeValue"));
      return;
    }

    setResult(
      buildResult(
        homePriceValue,
        downPaymentValue,
        interestRateValue,
        loanTermValue,
        propertyTaxValue,
        insuranceValue,
        hoaValue,
        pmiValue,
        extraValue
      )
    );
    setDigitStyle(
      resolveDigitStyle(
        homePrice,
        downPaymentMode === "percent" ? downPaymentPercent : downPaymentAmount,
        interestRate,
        loanTermYears,
        propertyTax,
        insurance,
        hoa,
        pmi,
        extraMonthlyPayment
      )
    );
  }

  function handleReset() {
    setHomePrice(String(DEFAULT_HOME_PRICE));
    setDownPaymentMode("percent");
    setDownPaymentAmount(String(DEFAULT_DOWN_PAYMENT_AMOUNT));
    setDownPaymentPercent(String(DEFAULT_DOWN_PAYMENT_PERCENT));
    setInterestRate(String(DEFAULT_INTEREST_RATE));
    setLoanTermYears(String(DEFAULT_LOAN_TERM_YEARS));
    setPropertyTax(String(DEFAULT_PROPERTY_TAX));
    setInsurance(String(DEFAULT_INSURANCE));
    setHoa("0");
    setPmi("0");
    setExtraMonthlyPayment("0");
    setError("");
    setDigitStyle("western");
    setResult(
      buildResult(
        DEFAULT_HOME_PRICE,
        DEFAULT_DOWN_PAYMENT_AMOUNT,
        DEFAULT_INTEREST_RATE,
        DEFAULT_LOAN_TERM_YEARS,
        DEFAULT_PROPERTY_TAX,
        DEFAULT_INSURANCE,
        0,
        0,
        0
      )
    );
  }

  return (
    <>
      <ToolAboveFold
        input={
          <MortgageInputPanel
            homePrice={homePrice}
            onHomePriceChange={setHomePrice}
            downPaymentMode={downPaymentMode}
            onDownPaymentModeChange={handleDownPaymentModeChange}
            downPaymentAmount={downPaymentAmount}
            onDownPaymentAmountChange={setDownPaymentAmount}
            downPaymentPercent={downPaymentPercent}
            onDownPaymentPercentChange={setDownPaymentPercent}
            interestRate={interestRate}
            onInterestRateChange={setInterestRate}
            loanTermYears={loanTermYears}
            onLoanTermYearsChange={setLoanTermYears}
            propertyTax={propertyTax}
            onPropertyTaxChange={setPropertyTax}
            insurance={insurance}
            onInsuranceChange={setInsurance}
            hoa={hoa}
            onHoaChange={setHoa}
            pmi={pmi}
            onPmiChange={setPmi}
            extraMonthlyPayment={extraMonthlyPayment}
            onExtraMonthlyPaymentChange={setExtraMonthlyPayment}
            error={error}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        }
        result={
          <div className="flex flex-col gap-4">
            <MortgageResult result={result} digitStyle={digitStyle} />
            <MortgageAffordabilityMini />
          </div>
        }
        sidebar={<MortgageRelatedSidebar />}
        secondary={<MortgagePayoffChart result={result} digitStyle={digitStyle} />}
      />

      <MortgageEducation />
    </>
  );
}
