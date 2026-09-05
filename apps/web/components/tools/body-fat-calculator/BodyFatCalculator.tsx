"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BodyFatCalculator as BodyFatTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import BodyFatInputPanel from "./BodyFatInputPanel";
import BodyFatResult from "./BodyFatResult";
import BodyFatQuickReference from "./BodyFatQuickReference";
import type { Gender } from "./types";

const tool = new BodyFatTool();

function toNum(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? -1 : n;
}

export default function BodyFatCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.body-fat-calculator.nav");
  const [gender, setGender] = useState<Gender>("male");
  const [heightCm, setHeightCm] = useState("180");
  const [neckCm, setNeckCm] = useState("38");
  const [waistCm, setWaistCm] = useState("85");
  const [hipCm, setHipCm] = useState("95");

  const digitStyle = resolveDigitStyle(heightCm, neckCm, waistCm, hipCm);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        gender,
        heightCm: toNum(heightCm),
        neckCm: toNum(neckCm),
        waistCm: toNum(waistCm),
        hipCm: gender === "female" ? toNum(hipCm) : undefined,
      },
      { locale: "en-US" },
    );
    return output.data;
  }, [gender, heightCm, neckCm, waistCm, hipCm]);

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
            <BodyFatInputPanel
              gender={gender}
              onGenderChange={setGender}
              heightCm={heightCm}
              onHeightCmChange={setHeightCm}
              neckCm={neckCm}
              onNeckCmChange={setNeckCm}
              waistCm={waistCm}
              onWaistCmChange={setWaistCm}
              hipCm={hipCm}
              onHipCmChange={setHipCm}
            />
          }
          result={<BodyFatResult result={result} gender={gender} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="body-fat-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <BodyFatQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
