"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateLoan } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import LoanInputPanel from "./LoanInputPanel";
import LoanResult from "./LoanResult";
import LoanPayoffChart from "./LoanPayoffChart";
import LoanAmortizationTable from "./LoanAmortizationTable";
import LoanDisclaimer from "./LoanDisclaimer";

const DEFAULTS = { loanAmount: "10000", interestRate: "8", loanTermYears: "5" };

export default function LoanCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.loan-calculator.nav");

  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);

  const digitStyle: DigitStyle = resolveDigitStyle(loanAmount, interestRate, loanTermYears);

  const result = useMemo(() => {
    const loanAmountValue = parseLocalizedNumber(loanAmount) || 0;
    const interestRateValue = parseLocalizedNumber(interestRate) || 0;
    const loanTermYearsValue = parseLocalizedNumber(loanTermYears) || 0;

    return calculateLoan(loanAmountValue, interestRateValue, loanTermYearsValue);
  }, [loanAmount, interestRate, loanTermYears]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "amortization", label: tNav("amortization") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <LoanInputPanel
              loanAmount={loanAmount}
              onLoanAmountChange={setLoanAmount}
              interestRate={interestRate}
              onInterestRateChange={setInterestRate}
              loanTermYears={loanTermYears}
              onLoanTermYearsChange={setLoanTermYears}
            />
          }
          result={
            <LoanResult
              monthlyPayment={result.monthlyPayment}
              loanAmount={result.loanAmount}
              totalInterest={result.totalInterest}
              totalPayment={result.totalPayment}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="loan-calculator" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <LoanPayoffChart
                amortizationSchedule={result.amortizationSchedule}
                loanAmount={result.loanAmount}
                totalInterest={result.totalInterest}
                digitStyle={digitStyle}
              />
              <LoanAmortizationTable amortizationSchedule={result.amortizationSchedule} digitStyle={digitStyle} />
              <LoanDisclaimer />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
