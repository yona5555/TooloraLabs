"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateIdealWeight, type Gender } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import IdealWeightInputPanel from "./IdealWeightInputPanel";
import IdealWeightResult from "./IdealWeightResult";

const DEFAULTS = { gender: "male" as Gender, heightCm: "175" };

export default function IdealWeightCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.ideal-weight-calculator.nav");

  const [gender, setGender] = useState<Gender>(DEFAULTS.gender);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);

  const digitStyle: DigitStyle = resolveDigitStyle(heightCm);

  const parsedHeightCm = parseLocalizedNumber(heightCm) || 0;

  const result = useMemo(() => calculateIdealWeight(gender, parsedHeightCm), [gender, parsedHeightCm]);

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
            <IdealWeightInputPanel
              gender={gender}
              onGenderChange={setGender}
              heightCm={heightCm}
              onHeightCmChange={setHeightCm}
            />
          }
          result={
            <IdealWeightResult
              result={result.average > 0 ? result : null}
              gender={gender}
              heightCm={parsedHeightCm}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="ideal-weight-calculator" category="health-fitness" />}
          secondary={<SectionNav items={navItems} />}
        />
      </div>

      {education}
    </>
  );
}
