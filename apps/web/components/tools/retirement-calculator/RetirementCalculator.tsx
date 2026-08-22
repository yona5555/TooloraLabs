"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateRetirement } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import RetirementInputPanel from "./RetirementInputPanel";
import RetirementResult from "./RetirementResult";

const DEFAULTS = {
  currentAge: "30",
  retirementAge: "65",
  currentSavings: "10000",
  monthlyContribution: "500",
  annualReturnRate: "7",
};

export default function RetirementCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.retirement-calculator.nav");

  const [currentAge, setCurrentAge] = useState(DEFAULTS.currentAge);
  const [retirementAge, setRetirementAge] = useState(DEFAULTS.retirementAge);
  const [currentSavings, setCurrentSavings] = useState(DEFAULTS.currentSavings);
  const [monthlyContribution, setMonthlyContribution] = useState(DEFAULTS.monthlyContribution);
  const [annualReturnRate, setAnnualReturnRate] = useState(DEFAULTS.annualReturnRate);

  const digitStyle: DigitStyle = resolveDigitStyle(
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    annualReturnRate
  );

  const parsedCurrentAge = parseLocalizedNumber(currentAge) || 0;
  const parsedRetirementAge = parseLocalizedNumber(retirementAge) || 0;
  const parsedCurrentSavings = parseLocalizedNumber(currentSavings) || 0;
  const parsedMonthlyContribution = parseLocalizedNumber(monthlyContribution) || 0;
  const parsedAnnualReturnRate = parseLocalizedNumber(annualReturnRate) || 0;

  const result = useMemo(
    () =>
      calculateRetirement(
        parsedCurrentAge,
        parsedRetirementAge,
        parsedCurrentSavings,
        parsedMonthlyContribution,
        parsedAnnualReturnRate
      ),
    [parsedCurrentAge, parsedRetirementAge, parsedCurrentSavings, parsedMonthlyContribution, parsedAnnualReturnRate]
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
            <RetirementInputPanel
              currentAge={currentAge}
              onCurrentAgeChange={setCurrentAge}
              retirementAge={retirementAge}
              onRetirementAgeChange={setRetirementAge}
              currentSavings={currentSavings}
              onCurrentSavingsChange={setCurrentSavings}
              monthlyContribution={monthlyContribution}
              onMonthlyContributionChange={setMonthlyContribution}
              annualReturnRate={annualReturnRate}
              onAnnualReturnRateChange={setAnnualReturnRate}
            />
          }
          result={
            <RetirementResult
              result={result.projectedBalance > 0 ? result : null}
              currentSavings={parsedCurrentSavings}
              monthlyContribution={parsedMonthlyContribution}
              annualReturnRate={parsedAnnualReturnRate}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="retirement-calculator" category="calculators" />}
          secondary={<SectionNav items={navItems} />}
        />
      </div>

      {education}
    </>
  );
}
