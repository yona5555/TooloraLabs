"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  calculateBMRMifflinStJeor,
  calculateBMRKatchMcArdle,
  calculateTDEE,
  calculateWeightGoal,
  feetInchesToCm,
  cmToFeetInches,
  lbToKg,
  kgToLb,
} from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import TDEEInputPanel from "./TDEEInputPanel";
import TDEEResult from "./TDEEResult";
import TDEEDisclaimer from "./TDEEDisclaimer";
import type { ActivityLevel, Gender, GoalDirection, TDEEScenario, UnitSystem } from "./types";

const DEFAULTS = {
  unitSystem: "metric" as UnitSystem,
  heightCm: "175",
  weightKg: "70",
  heightFt: "5",
  heightIn: "9",
  weightLb: "154",
  age: "30",
  gender: "male" as Gender,
  activityLevel: "moderate" as ActivityLevel,
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export default function TDEECalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.tdee-calculator.nav");

  const [unitSystem, setUnitSystem] = useState<UnitSystem>(DEFAULTS.unitSystem);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [weightLb, setWeightLb] = useState(DEFAULTS.weightLb);
  const [age, setAge] = useState(DEFAULTS.age);
  const [gender, setGender] = useState<Gender>(DEFAULTS.gender);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(DEFAULTS.activityLevel);
  const [useBodyFat, setUseBodyFat] = useState(false);
  const [bodyFatPercent, setBodyFatPercent] = useState("15");
  const [goalDirection, setGoalDirection] = useState<GoalDirection>("maintain");
  const [weeklyRateKg, setWeeklyRateKg] = useState("0.5");

  function handleScenarioPreset(scenario: TDEEScenario) {
    const heightCmValue = parseLocalizedNumber(scenario.heightCm);
    const weightKgValue = parseLocalizedNumber(scenario.weightKg);
    setUnitSystem("metric");
    setHeightCm(scenario.heightCm);
    setWeightKg(scenario.weightKg);
    const { feet, inches } = cmToFeetInches(heightCmValue);
    setHeightFt(String(feet));
    setHeightIn(String(inches));
    setWeightLb(String(round1(kgToLb(weightKgValue))));
    setAge(scenario.age);
    setGender(scenario.gender);
    setActivityLevel(scenario.activityLevel);
    setUseBodyFat(false);
  }

  function handleClear() {
    setUnitSystem(DEFAULTS.unitSystem);
    setHeightCm(DEFAULTS.heightCm);
    setWeightKg(DEFAULTS.weightKg);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setWeightLb(DEFAULTS.weightLb);
    setAge(DEFAULTS.age);
    setGender(DEFAULTS.gender);
    setActivityLevel(DEFAULTS.activityLevel);
    setUseBodyFat(false);
    setBodyFatPercent("15");
    setGoalDirection("maintain");
    setWeeklyRateKg("0.5");
  }

  const digitStyle: DigitStyle = resolveDigitStyle(heightCm, weightKg, age, weeklyRateKg);

  const { bmr, tdee, goal } = useMemo(() => {
    const heightCmValue = unitSystem === "metric" ? parseLocalizedNumber(heightCm) : feetInchesToCm({ feet: parseLocalizedNumber(heightFt) || 0, inches: parseLocalizedNumber(heightIn) || 0 });
    const weightKgValue = unitSystem === "metric" ? parseLocalizedNumber(weightKg) : lbToKg(parseLocalizedNumber(weightLb) || 0);
    const ageValue = parseLocalizedNumber(age);
    const bodyFatValue = parseLocalizedNumber(bodyFatPercent);

    const computedBmr =
      useBodyFat && !Number.isNaN(bodyFatValue) && bodyFatValue > 0
        ? calculateBMRKatchMcArdle(weightKgValue, bodyFatValue)
        : calculateBMRMifflinStJeor(weightKgValue, heightCmValue, ageValue, gender);
    const computedTdee = calculateTDEE(computedBmr, activityLevel);

    const rateValue = parseLocalizedNumber(weeklyRateKg) || 0;
    const signedRate = goalDirection === "lose" ? -Math.abs(rateValue) : goalDirection === "gain" ? Math.abs(rateValue) : 0;
    const computedGoal = calculateWeightGoal(computedTdee, signedRate);

    return { bmr: computedBmr, tdee: computedTdee, goal: computedGoal };
  }, [unitSystem, heightCm, weightKg, heightFt, heightIn, weightLb, age, gender, activityLevel, useBodyFat, bodyFatPercent, goalDirection, weeklyRateKg]);

  useEffect(() => {
    if (!Number.isFinite(goal.dailyCalorieTarget) || goal.dailyCalorieTarget <= 0) return;
    try {
      window.localStorage.setItem(
        "toolora:tdee-result",
        JSON.stringify({ dailyCalorieTarget: Math.round(goal.dailyCalorieTarget), tdee: Math.round(tdee) }),
      );
    } catch {
      // localStorage unavailable (private browsing, etc.) — the Macro Calculator's
      // "use my TDEE calories" link simply won't have anything to read, which it handles.
    }
  }, [goal.dailyCalorieTarget, tdee]);

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
            <TDEEInputPanel
              unitSystem={unitSystem}
              onUnitSystemChange={setUnitSystem}
              heightCm={heightCm}
              onHeightCmChange={setHeightCm}
              weightKg={weightKg}
              onWeightKgChange={setWeightKg}
              heightFt={heightFt}
              onHeightFtChange={setHeightFt}
              heightIn={heightIn}
              onHeightInChange={setHeightIn}
              weightLb={weightLb}
              onWeightLbChange={setWeightLb}
              age={age}
              onAgeChange={setAge}
              gender={gender}
              onGenderChange={setGender}
              activityLevel={activityLevel}
              onActivityLevelChange={setActivityLevel}
              useBodyFat={useBodyFat}
              onUseBodyFatChange={setUseBodyFat}
              bodyFatPercent={bodyFatPercent}
              onBodyFatPercentChange={setBodyFatPercent}
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={
            <TDEEResult
              bmr={bmr}
              tdee={tdee}
              goalDirection={goalDirection}
              onGoalDirectionChange={setGoalDirection}
              weeklyRateKg={weeklyRateKg}
              onWeeklyRateKgChange={setWeeklyRateKg}
              dailyCalorieTarget={goal.dailyCalorieTarget}
              adjustmentPercentOfTDEE={goal.adjustmentPercentOfTDEE}
              dailyAdjustment={goal.dailyAdjustment}
              isAggressive={goal.isAggressive}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="tdee-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="tdee-calculator" />
              <TDEEDisclaimer />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
