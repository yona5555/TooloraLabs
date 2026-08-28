"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MolarMassCalculator as MolarMassCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import MolarMassInputPanel from "./MolarMassInputPanel";
import MolarMassResult from "./MolarMassResult";
import MolarMassQuickReference from "./MolarMassQuickReference";

const tool = new MolarMassCalculatorTool();

export default function MolarMassCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.molar-mass-calculator.nav");

  const [formula, setFormula] = useState("C6H12O6");

  const digitStyle = resolveDigitStyle(formula);

  const result = useMemo(() => tool.execute({ formula }, { locale: "en-US" }).data, [formula]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<MolarMassInputPanel formula={formula} onFormulaChange={setFormula} />}
          result={<MolarMassResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="molar-mass-calculator" category="math-science" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <MolarMassQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
