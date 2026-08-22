"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateHouseAffordability } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import HouseAffordabilityInputPanel from "./HouseAffordabilityInputPanel";
import HouseAffordabilityResult from "./HouseAffordabilityResult";

const DEFAULTS = {
  annualIncome: "90000",
  monthlyDebts: "400",
  downPayment: "40000",
  interestRate: "6.5",
  loanTermYears: "30",
  propertyTaxRate: "1.2",
  annualHomeInsurance: "1500",
  monthlyHOA: "0",
};

export default function HouseAffordabilityCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.house-affordability-calculator.nav");

  const [annualIncome, setAnnualIncome] = useState(DEFAULTS.annualIncome);
  const [monthlyDebts, setMonthlyDebts] = useState(DEFAULTS.monthlyDebts);
  const [downPayment, setDownPayment] = useState(DEFAULTS.downPayment);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [propertyTaxRate, setPropertyTaxRate] = useState(DEFAULTS.propertyTaxRate);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState(DEFAULTS.annualHomeInsurance);
  const [monthlyHOA, setMonthlyHOA] = useState(DEFAULTS.monthlyHOA);

  const digitStyle: DigitStyle = resolveDigitStyle(
    annualIncome,
    monthlyDebts,
    downPayment,
    interestRate,
    loanTermYears,
    propertyTaxRate,
    annualHomeInsurance,
    monthlyHOA
  );

  const parsedAnnualIncome = parseLocalizedNumber(annualIncome) || 0;
  const parsedMonthlyDebts = parseLocalizedNumber(monthlyDebts) || 0;
  const parsedDownPayment = parseLocalizedNumber(downPayment) || 0;
  const parsedInterestRate = parseLocalizedNumber(interestRate) || 0;
  const parsedLoanTermYears = parseLocalizedNumber(loanTermYears) || 0;
  const parsedPropertyTaxRate = parseLocalizedNumber(propertyTaxRate) || 0;
  const parsedAnnualHomeInsurance = parseLocalizedNumber(annualHomeInsurance) || 0;
  const parsedMonthlyHOA = parseLocalizedNumber(monthlyHOA) || 0;

  const result = useMemo(
    () =>
      calculateHouseAffordability(
        parsedAnnualIncome,
        parsedMonthlyDebts,
        parsedDownPayment,
        parsedInterestRate,
        parsedLoanTermYears,
        parsedPropertyTaxRate,
        parsedAnnualHomeInsurance,
        parsedMonthlyHOA
      ),
    [
      parsedAnnualIncome,
      parsedMonthlyDebts,
      parsedDownPayment,
      parsedInterestRate,
      parsedLoanTermYears,
      parsedPropertyTaxRate,
      parsedAnnualHomeInsurance,
      parsedMonthlyHOA,
    ]
  );

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <HouseAffordabilityInputPanel
              annualIncome={annualIncome}
              onAnnualIncomeChange={setAnnualIncome}
              monthlyDebts={monthlyDebts}
              onMonthlyDebtsChange={setMonthlyDebts}
              downPayment={downPayment}
              onDownPaymentChange={setDownPayment}
              interestRate={interestRate}
              onInterestRateChange={setInterestRate}
              loanTermYears={loanTermYears}
              onLoanTermYearsChange={setLoanTermYears}
              propertyTaxRate={propertyTaxRate}
              onPropertyTaxRateChange={setPropertyTaxRate}
              annualHomeInsurance={annualHomeInsurance}
              onAnnualHomeInsuranceChange={setAnnualHomeInsurance}
              monthlyHOA={monthlyHOA}
              onMonthlyHOAChange={setMonthlyHOA}
            />
          }
          result={
            <HouseAffordabilityResult
              result={result.maxHomePrice > 0 ? result : null}
              annualIncome={parsedAnnualIncome}
              downPayment={parsedDownPayment}
              interestRate={parsedInterestRate}
              loanTermYears={parsedLoanTermYears}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="house-affordability-calculator" category="calculators" />}
          secondary={<SectionNav items={navItems} />}
        />
      </div>

      {education}
    </>
  );
}
