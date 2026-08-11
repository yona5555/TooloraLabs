"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { TipCalculator as TipCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import TipInputPanel from "./TipInputPanel";
import TipResult from "./TipResult";
import TipInternationalNorms from "./TipInternationalNorms";

const tool = new TipCalculatorTool();

export default function TipCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.tip-calculator.nav");

  const [billAmount, setBillAmount] = useState("64");
  const [tipPercent, setTipPercent] = useState("18");
  const [people, setPeople] = useState("2");
  const [roundUpPerPerson, setRoundUpPerPerson] = useState(false);

  const digitStyle: DigitStyle = resolveDigitStyle(billAmount, tipPercent, people);

  const result = useMemo(() => {
    const bill = parseLocalizedNumber(billAmount) || 0;
    const tip = parseLocalizedNumber(tipPercent) || 0;
    const peopleCount = parseLocalizedNumber(people) || 1;
    const output = tool.execute({ billAmount: bill, tipPercent: tip, people: peopleCount, roundUpPerPerson }, { locale: "en-US" });
    return output.data;
  }, [billAmount, tipPercent, people, roundUpPerPerson]);

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
            <TipInputPanel
              billAmount={billAmount}
              onBillAmountChange={setBillAmount}
              tipPercent={tipPercent}
              onTipPercentChange={setTipPercent}
              people={people}
              onPeopleChange={setPeople}
              roundUpPerPerson={roundUpPerPerson}
              onRoundUpPerPersonChange={setRoundUpPerPerson}
            />
          }
          result={<TipResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="tip-calculator" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <TipInternationalNorms />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
