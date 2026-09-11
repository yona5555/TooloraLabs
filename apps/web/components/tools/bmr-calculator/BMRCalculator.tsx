"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BMRCalculator as BMRTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import BMRInputPanel from "./BMRInputPanel";
import BMRResult from "./BMRResult";
import BMRQuickReference from "./BMRQuickReference";
import BMRDisclaimer from "./BMRDisclaimer";
import { type BMRFormula, type BMRScenario, type Gender } from "./types";

const tool = new BMRTool();

const DEFAULTS = { gender: "male" as Gender, weightKg: "75", heightCm: "175", age: "30" };

function toNum(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? -1 : n;
}

export default function BMRCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.bmr-calculator.nav");
  const [gender, setGender] = useState<Gender>(DEFAULTS.gender);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [age, setAge] = useState(DEFAULTS.age);
  const [formula, setFormula] = useState<BMRFormula>("compare");

  function handleScenarioPreset(scenario: BMRScenario) {
    setGender(scenario.gender);
    setWeightKg(scenario.weightKg);
    setHeightCm(scenario.heightCm);
    setAge(scenario.age);
  }

  function handleClear() {
    setGender(DEFAULTS.gender);
    setWeightKg(DEFAULTS.weightKg);
    setHeightCm(DEFAULTS.heightCm);
    setAge(DEFAULTS.age);
  }

  const digitStyle = resolveDigitStyle(weightKg, heightCm, age);

  const result = useMemo(() => {
    const output = tool.execute(
      { gender, weightKg: toNum(weightKg), heightCm: toNum(heightCm), age: toNum(age), formula },
      { locale: "en-US" },
    );
    return output.data;
  }, [gender, weightKg, heightCm, age, formula]);

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
            <BMRInputPanel
              gender={gender}
              onGenderChange={setGender}
              weightKg={weightKg}
              onWeightKgChange={setWeightKg}
              heightCm={heightCm}
              onHeightCmChange={setHeightCm}
              age={age}
              onAgeChange={setAge}
              formula={formula}
              onFormulaChange={setFormula}
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={<BMRResult result={result} digitStyle={digitStyle} gender={gender} weightKg={weightKg} heightCm={heightCm} age={age} />}
          sidebar={<RelatedToolsSidebar currentSlug="bmr-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="bmr-calculator" />
              <BMRQuickReference />
              <BMRDisclaimer />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
