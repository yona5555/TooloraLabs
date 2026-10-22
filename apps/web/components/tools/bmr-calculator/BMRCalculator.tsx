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
import BMRRangeLadder from "./BMRRangeLadder";
import BMRDisclaimer from "./BMRDisclaimer";
import { BMRLiveContext, type BMRLive } from "./BMRLiveContext";
import { bmrPair, whichOf, type Body } from "./bmr";
import { type BMRFormula, type BMRScenario, type Gender } from "./types";

const tool = new BMRTool();

const DEFAULTS = { gender: "male" as Gender, weightKg: "75", heightCm: "175", age: "30" };
const DEFAULT_BODY: Body = { gender: "male", weightKg: 75, heightCm: 175, age: 30 };

const r1 = (v: number) => Math.round(v * 10) / 10;

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

  const body: Body = { gender, weightKg: toNum(weightKg), heightCm: toNum(heightCm), age: toNum(age) };
  const result = useMemo(
    () => tool.execute({ ...body, formula }, { locale: "en-US" }).data,
    [gender, weightKg, heightCm, age, formula], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Live: every valid edit updates the result at once; an invalid or half-typed field keeps the
  // last good result on screen, with the invalid-measurements note.
  const pair = useMemo(() => bmrPair(body), [gender, weightKg, heightCm, age]); // eslint-disable-line react-hooks/exhaustive-deps
  const valid = result.error === null && pair !== null;
  const [good, setGood] = useState(() => ({ body: DEFAULT_BODY, pair: bmrPair(DEFAULT_BODY)! }));
  // Adjust state while rendering (no effect): keep the latest valid measurements.
  if (valid && pair && good.pair !== pair) setGood({ body, pair });
  const shown = valid && pair ? { body, pair } : good;
  const which = whichOf(formula);

  const liveCtx = useMemo<BMRLive>(
    () => ({
      body: shown.body,
      hb: shown.pair.hb,
      msj: shown.pair.msj,
      formula,
      which,
      bmr: shown.pair[which],
      setWeightKg: (kg: number) => setWeightKg(String(r1(kg))),
      setAge: (years: number) => setAge(String(Math.round(years))),
    }),
    [shown.pair, shown.body.gender, shown.body.weightKg, shown.body.heightCm, shown.body.age, formula, which], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <BMRLiveContext.Provider value={liveCtx}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          input={
            <div className="flex flex-col gap-4 lg:h-full">
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
              <BMRRangeLadder />
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <BMRResult fill invalid={!valid} digitStyle={digitStyle} gender={gender} weightKg={weightKg} heightCm={heightCm} age={age} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="bmr-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="bmr-calculator" />
              <BMRDisclaimer />
            </div>
          }
        />
      </div>

      {education}
    </BMRLiveContext.Provider>
  );
}
