"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { Gender } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import IdealWeightInputPanel from "./IdealWeightInputPanel";
import IdealWeightResult from "./IdealWeightResult";
import IdealWeightHeightLadder from "./IdealWeightHeightLadder";
import { IdealWeightLiveContext, type IdealWeightLive } from "./IdealWeightLiveContext";
import { H_MAX, H_MIN, W_MAX, W_MIN, ideal, weightAt } from "./iw";
import type { IdealWeightScenario } from "./types";

const DEFAULTS = { gender: "male" as Gender, heightCm: "175", currentKg: "80" };

const r1 = (v: number) => Math.round(v * 10) / 10;

function toNum(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? -1 : n;
}

type Good = { gender: Gender; heightCm: number; currentKg: number | null };

export default function IdealWeightCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.ideal-weight-calculator.nav");

  const [gender, setGender] = useState<Gender>(DEFAULTS.gender);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [currentKg, setCurrentKg] = useState(DEFAULTS.currentKg);

  function handleScenarioPreset(scenario: IdealWeightScenario) {
    setGender(scenario.gender);
    setHeightCm(scenario.heightCm);
  }

  function handleClear() {
    setGender(DEFAULTS.gender);
    setHeightCm(DEFAULTS.heightCm);
    setCurrentKg(DEFAULTS.currentKg);
  }

  const digitStyle: DigitStyle = resolveDigitStyle(heightCm, currentKg);

  // Live: every valid edit updates the result at once; an invalid or half-typed field keeps the
  // last good result on screen with a short note. The current weight is optional (empty = none).
  const h = toNum(heightCm);
  const w = currentKg.trim() === "" ? null : toNum(currentKg);
  const hOk = h >= H_MIN && h <= H_MAX;
  const wOk = w === null || (w >= W_MIN && w <= W_MAX);
  const valid = hOk && wOk;
  const [good, setGood] = useState<Good>({ gender: DEFAULTS.gender, heightCm: 175, currentKg: 80 });
  // Adjust state while rendering (no effect): keep the latest valid measurements.
  if (valid && (good.gender !== gender || good.heightCm !== h || good.currentKg !== w)) setGood({ gender, heightCm: h, currentKg: w });
  const shown: Good = valid ? { gender, heightCm: h, currentKg: w } : good;

  const r = useMemo(() => ideal(shown.gender, shown.heightCm), [shown.gender, shown.heightCm]);

  const liveCtx = useMemo<IdealWeightLive>(
    () => ({
      gender: shown.gender,
      heightCm: shown.heightCm,
      current: shown.currentKg ?? r1(weightAt(25, shown.heightCm)),
      currentGiven: shown.currentKg !== null,
      r,
      setHeightCm: (cm: number) => setHeightCm(String(r1(cm))),
      setCurrentKg: (kg: number) => setCurrentKg(String(r1(kg))),
    }),
    [shown.gender, shown.heightCm, shown.currentKg, r],
  );

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <IdealWeightLiveContext.Provider value={liveCtx}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          input={
            <div className="flex flex-col gap-4 lg:h-full">
              <IdealWeightInputPanel
                gender={gender}
                onGenderChange={setGender}
                heightCm={heightCm}
                onHeightCmChange={setHeightCm}
                currentKg={currentKg}
                onCurrentKgChange={setCurrentKg}
                onScenarioPreset={handleScenarioPreset}
                onClear={handleClear}
              />
              <IdealWeightHeightLadder />
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <IdealWeightResult fill invalid={!valid} gender={gender} heightCm={heightCm} digitStyle={digitStyle} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="ideal-weight-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="ideal-weight-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </IdealWeightLiveContext.Provider>
  );
}
