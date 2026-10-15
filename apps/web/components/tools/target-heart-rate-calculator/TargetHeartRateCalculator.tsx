"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TargetHeartRateCalculator as TargetHeartRateTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import TargetHeartRateInputPanel from "./TargetHeartRateInputPanel";
import TargetHeartRateResult from "./TargetHeartRateResult";
import TargetHeartRateQuickReference from "./TargetHeartRateQuickReference";
import { HRLiveContext, type HRLive, type HRSnapshot } from "./HRLiveContext";
import type { HeartRateScenario } from "./types";

const tool = new TargetHeartRateTool();

const DEFAULTS = { age: "30", useRestingHeartRate: false, restingHeartRate: "60" };
const DEFAULT_INTENSITY = 70;

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

function compute(age: string, useResting: boolean, resting: string): HRSnapshot {
  const ageNum = toNum(age) ?? -1;
  const restingNum = useResting ? toNum(resting) : undefined;
  const output = tool.execute({ age: ageNum, restingHeartRate: restingNum }, { locale: "en-US" });
  return { data: output.data, age: ageNum, rest: output.data.restingHeartRate };
}

export default function TargetHeartRateCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.target-heart-rate-calculator.nav");
  const [age, setAge] = useState(DEFAULTS.age);
  const [useRestingHeartRate, setUseRestingHeartRate] = useState(DEFAULTS.useRestingHeartRate);
  const [restingHeartRate, setRestingHeartRate] = useState(DEFAULTS.restingHeartRate);
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY);

  function handleScenarioPreset(scenario: HeartRateScenario) {
    setAge(scenario.age);
    setUseRestingHeartRate(scenario.useRestingHeartRate);
    setRestingHeartRate(scenario.restingHeartRate);
  }

  function handleClear() {
    setAge(DEFAULTS.age);
    setUseRestingHeartRate(DEFAULTS.useRestingHeartRate);
    setRestingHeartRate(DEFAULTS.restingHeartRate);
    setIntensity(DEFAULT_INTENSITY);
  }

  const digitStyle = resolveDigitStyle(age, restingHeartRate);

  // Live: every edit recomputes at once; an invalid or half-typed field keeps the last good
  // result on screen (the Result card shows the error line above it).
  const live = useMemo(() => compute(age, useRestingHeartRate, restingHeartRate), [age, useRestingHeartRate, restingHeartRate]);
  const [good, setGood] = useState<HRSnapshot>(() => compute(DEFAULTS.age, DEFAULTS.useRestingHeartRate, DEFAULTS.restingHeartRate));
  if (!live.data.error && live !== good) setGood(live);
  const shown = live.data.error ? good : live;

  const liveCtx = useMemo<HRLive>(() => ({ snap: shown, intensity, setIntensity }), [shown, intensity]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <HRLiveContext.Provider value={liveCtx}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchResult
          input={
            <div className="flex flex-col gap-4">
              <TargetHeartRateInputPanel
                age={age}
                onAgeChange={setAge}
                useRestingHeartRate={useRestingHeartRate}
                onUseRestingHeartRateChange={setUseRestingHeartRate}
                restingHeartRate={restingHeartRate}
                onRestingHeartRateChange={setRestingHeartRate}
                onScenarioPreset={handleScenarioPreset}
                onClear={handleClear}
              />
              <TargetHeartRateQuickReference />
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <TargetHeartRateResult
                fill
                snap={shown}
                error={live.data.error}
                intensity={intensity}
                digitStyle={digitStyle}
                age={age}
                useRestingHeartRate={useRestingHeartRate}
                restingHeartRate={restingHeartRate}
              />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="target-heart-rate-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="target-heart-rate-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </HRLiveContext.Provider>
  );
}
