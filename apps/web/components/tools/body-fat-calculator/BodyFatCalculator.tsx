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
import BodyFatAceLadder from "./BodyFatAceLadder";
import { BodyFatLiveContext, type BodyFatLive } from "./BodyFatLiveContext";
import type { Measures } from "./ace";
import { type BodyFatScenario, type Gender } from "./types";

const tool = new BodyFatTool();

const r1 = (v: number) => Math.round(v * 10) / 10;

function run(m: Measures) {
  return tool.execute(
    { gender: m.gender, heightCm: m.heightCm, neckCm: m.neckCm, waistCm: m.waistCm, hipCm: m.gender === "female" ? m.hipCm : undefined },
    { locale: "en-US" },
  ).data;
}

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
    setWeightSet(null);
  }

  function handleClear() {
    setGender(DEFAULTS.gender);
    setHeightCm(DEFAULTS.heightCm);
    setNeckCm(DEFAULTS.neckCm);
    setWaistCm(DEFAULTS.waistCm);
    setHipCm(DEFAULTS.hipCm);
    setWeightSet(null);
  }

  const digitStyle = resolveDigitStyle(heightCm, neckCm, waistCm, hipCm);

  const measures: Measures = { gender, heightCm: toNum(heightCm), neckCm: toNum(neckCm), waistCm: toNum(waistCm), hipCm: toNum(hipCm) };
  const result = useMemo(() => run(measures), [gender, heightCm, neckCm, waistCm, hipCm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live: every valid edit updates the result at once; an invalid or half-typed field keeps the
  // last good result (and its measurements) on screen, with the invalid-measurements note.
  const valid = result.error === null && result.category !== null && measures.heightCm >= 50 && measures.heightCm <= 250;
  const [good, setGood] = useState(() => {
    const m: Measures = { gender: DEFAULTS.gender, heightCm: 180, neckCm: 38, waistCm: 85, hipCm: 95 };
    return { m, data: run(m) };
  });
  // Adjust state while rendering (no effect): keep the latest valid measurements.
  if (valid && good.data !== result) setGood({ m: measures, data: result });
  const shown = valid ? { m: measures, data: result } : good;

  // The Navy method needs no weight; the fat/lean split is read at an assumed weight, seeded at
  // BMI 22 for the height until the composition card sets it.
  const [weightSet, setWeightSet] = useState<number | null>(null);
  const weightSeed = r1(22 * (shown.m.heightCm / 100) ** 2);
  const weightKg = weightSet ?? weightSeed;

  const liveCtx = useMemo<BodyFatLive>(
    () => ({
      m: shown.m,
      bf: shown.data.bodyFatPercent,
      category: shown.data.category ?? "average",
      weightKg,
      weightSeed,
      setWeightKg: (kg: number) => setWeightSet(r1(kg)),
      setWaistCm: (cm: number) => setWaistCm(String(r1(cm))),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shown.data, shown.m.gender, shown.m.heightCm, shown.m.neckCm, shown.m.waistCm, shown.m.hipCm, weightKg, weightSeed],
  );

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <BodyFatLiveContext.Provider value={liveCtx}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          input={
            <div className="flex flex-col gap-4 lg:h-full">
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
            <BodyFatAceLadder />
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <BodyFatResult
                fill
                result={shown.data}
                measures={shown.m}
                invalid={!valid}
                gender={gender}
                heightCm={heightCm}
                neckCm={neckCm}
                waistCm={waistCm}
                hipCm={hipCm}
                digitStyle={digitStyle}
              />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="body-fat-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="body-fat-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </BodyFatLiveContext.Provider>
  );
}
