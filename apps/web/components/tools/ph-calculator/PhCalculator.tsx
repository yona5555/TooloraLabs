"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { PhCalculator as PhCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import PhInputPanel from "./PhInputPanel";
import PhResult from "./PhResult";
import PhQuickReference from "./PhQuickReference";
import type { PhOperation } from "./types";

const tool = new PhCalculatorTool();

export default function PhCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.ph-calculator.nav");

  const [operation, setOperation] = useState<PhOperation>("fromPH");
  const [hConcentration, setHConcentration] = useState("0.0000001");
  const [pH, setPH] = useState("7");
  const [ohConcentration, setOhConcentration] = useState("0.0000001");
  const [pOH, setPOH] = useState("7");

  const digitStyle: DigitStyle = resolveDigitStyle(hConcentration, pH, ohConcentration, pOH);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        operation,
        hConcentration: parseLocalizedNumber(hConcentration) || 0,
        pH: parseLocalizedNumber(pH) || 0,
        ohConcentration: parseLocalizedNumber(ohConcentration) || 0,
        pOH: parseLocalizedNumber(pOH) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [operation, hConcentration, pH, ohConcentration, pOH]);

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
            <PhInputPanel
              operation={operation}
              onOperationChange={setOperation}
              hConcentration={hConcentration}
              onHConcentrationChange={setHConcentration}
              pH={pH}
              onPHChange={setPH}
              ohConcentration={ohConcentration}
              onOhConcentrationChange={setOhConcentration}
              pOH={pOH}
              onPOHChange={setPOH}
            />
          }
          result={<PhResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="ph-calculator" category="math-science" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <PhQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
