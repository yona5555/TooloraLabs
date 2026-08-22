"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateAffordableLoan } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import AffordableLoanInputPanel from "./AffordableLoanInputPanel";
import AffordableLoanResult from "./AffordableLoanResult";

const DEFAULTS = { monthlyPayment: "300", interestRate: "6", loanTermYears: "5" };

export default function AffordableLoanCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.affordable-loan-calculator.nav");

  const [monthlyPayment, setMonthlyPayment] = useState(DEFAULTS.monthlyPayment);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);

  const digitStyle: DigitStyle = resolveDigitStyle(monthlyPayment, interestRate, loanTermYears);

  const parsedInterestRate = parseLocalizedNumber(interestRate) || 0;
  const parsedLoanTermYears = parseLocalizedNumber(loanTermYears) || 0;

  const result = useMemo(() => {
    const monthlyPaymentValue = parseLocalizedNumber(monthlyPayment) || 0;
    return calculateAffordableLoan(monthlyPaymentValue, parsedInterestRate, parsedLoanTermYears);
  }, [monthlyPayment, parsedInterestRate, parsedLoanTermYears]);

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
            <AffordableLoanInputPanel
              monthlyPayment={monthlyPayment}
              onMonthlyPaymentChange={setMonthlyPayment}
              interestRate={interestRate}
              onInterestRateChange={setInterestRate}
              loanTermYears={loanTermYears}
              onLoanTermYearsChange={setLoanTermYears}
            />
          }
          result={
            <AffordableLoanResult
              result={result.maxLoanAmount > 0 ? result : null}
              interestRate={parsedInterestRate}
              loanTermYears={parsedLoanTermYears}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="affordable-loan-calculator" category="calculators" />}
          secondary={<SectionNav items={navItems} />}
        />
      </div>

      {education}
    </>
  );
}
