"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BodyFatCalculator as BodyFatTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import BodyFatInputPanel from "./BodyFatInputPanel";
import BodyFatResult from "./BodyFatResult";
import BodyFatQuickReference from "./BodyFatQuickReference";
import { type BodyFatScenario, type Gender } from "./types";

const tool = new BodyFatTool();

const DEFAULTS = { gender: "male" as Gender, heightCm: "180", neckCm: "38", waistCm: "85", hipCm: "95" };

function toNum(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? -1 : n;
}

export default function BodyFatCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.body-fat-calculator.nav");
  const [gender, setGender] = useState<Gender>(DEFAULTS.gender);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [neckCm, setNeckCm] = useState(DEFAULTS.neckCm);
  const [waistCm, setWaistCm] = useState(DEFAULTS.waistCm);
  const [hipCm, setHipCm] = useState(DEFAULTS.hipCm);

  function handleScenarioPreset(scenario: BodyFatScenario) {
    setGender(scenario.gender);
    setHeightCm(scenario.heightCm);
    setNeckCm(scenario.neckCm);
    setWaistCm(scenario.waistCm);
    setHipCm(scenario.hipCm);
  }

  function handleClear() {
    setGender(DEFAULTS.gender);
    setHeightCm(DEFAULTS.heightCm);
    setNeckCm(DEFAULTS.neckCm);
    setWaistCm(DEFAULTS.waistCm);
    setHipCm(DEFAULTS.hipCm);
  }

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
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={<BodyFatResult result={result} gender={gender} heightCm={heightCm} neckCm={neckCm} waistCm={waistCm} hipCm={hipCm} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="body-fat-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="body-fat-calculator" />
              <BodyFatQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
