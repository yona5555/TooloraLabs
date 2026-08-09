"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateCompoundInterest } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import CompoundInterestInputPanel from "./CompoundInterestInputPanel";
import CompoundInterestResult from "./CompoundInterestResult";
import CompoundInterestGrowthChart from "./CompoundInterestGrowthChart";
import CompoundInterestDisclaimer from "./CompoundInterestDisclaimer";
import type { CompoundingFrequency } from "./types";

export default function CompoundInterestCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.compound-interest-calculator.nav");

  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("10");
  const [frequency, setFrequency] = useState<CompoundingFrequency>("monthly");
  const [monthlyContribution, setMonthlyContribution] = useState("100");

  const digitStyle: DigitStyle = resolveDigitStyle(principal, rate, years, monthlyContribution);

  const result = useMemo(() => {
    const principalValue = parseLocalizedNumber(principal) || 0;
    const rateValue = parseLocalizedNumber(rate) || 0;
    const yearsValue = parseLocalizedNumber(years) || 0;
    const contributionValue = parseLocalizedNumber(monthlyContribution) || 0;

    return calculateCompoundInterest(principalValue, rateValue, yearsValue, frequency, contributionValue);
  }, [principal, rate, years, frequency, monthlyContribution]);

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
            <CompoundInterestInputPanel
              principal={principal}
              onPrincipalChange={setPrincipal}
              rate={rate}
              onRateChange={setRate}
              years={years}
              onYearsChange={setYears}
              frequency={frequency}
              onFrequencyChange={setFrequency}
              monthlyContribution={monthlyContribution}
              onMonthlyContributionChange={setMonthlyContribution}
            />
          }
          result={
            <CompoundInterestResult
              futureValue={result.futureValue}
              principal={result.principal}
              totalContributions={result.totalContributions}
              totalInterest={result.totalInterest}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="compound-interest-calculator" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <CompoundInterestGrowthChart
                yearlySchedule={result.yearlySchedule}
                principal={result.principal}
                totalContributions={result.totalContributions}
                totalInterest={result.totalInterest}
                digitStyle={digitStyle}
              />
              <CompoundInterestDisclaimer />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
