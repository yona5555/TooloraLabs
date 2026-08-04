"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  BMICalculator as BMICalculatorTool,
  estimateBodyFatPercentage,
  feetInchesToCm,
  cmToFeetInches,
  lbToKg,
  kgToLb,
  type Gender,
} from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import BMIInputPanel from "./BMIInputPanel";
import BMIQuickInsight from "./BMIQuickInsight";
import BMIResult from "./BMIResult";
import BMIMiniConverter from "./BMIMiniConverter";
import BMIRecommendations from "./BMIRecommendations";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import type { BMIExtendedResult, UnitSystem } from "./types";

const tool = new BMICalculatorTool();
const DEFAULT_HEIGHT_CM = 170;
const DEFAULT_WEIGHT_KG = 70;
const DEFAULT_AGE = 30;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function buildExtendedResult(heightCm: number, weightKg: number, age: number, gender: Gender): BMIExtendedResult {
  const output = tool.execute({ heightCm, weightKg }, { locale: "en-US" });
  const heightM = heightCm / 100;

  return {
    ...output.data,
    weightKg,
    heightCm,
    ponderalIndex: Number((weightKg / heightM ** 3).toFixed(1)),
    bodyFatEstimate: estimateBodyFatPercentage(output.data.bmi, age, gender),
  };
}

export default function BMICalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.bmi-calculator");

  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState(String(DEFAULT_HEIGHT_CM));
  const [weightKg, setWeightKg] = useState(String(DEFAULT_WEIGHT_KG));
  const [heightFt, setHeightFt] = useState(String(cmToFeetInches(DEFAULT_HEIGHT_CM).feet));
  const [heightIn, setHeightIn] = useState(String(cmToFeetInches(DEFAULT_HEIGHT_CM).inches));
  const [weightLb, setWeightLb] = useState(String(round1(kgToLb(DEFAULT_WEIGHT_KG))));
  const [age, setAge] = useState(String(DEFAULT_AGE));
  const [gender, setGender] = useState<Gender>("male");
  const [error, setError] = useState("");
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [result, setResult] = useState<BMIExtendedResult>(() =>
    buildExtendedResult(DEFAULT_HEIGHT_CM, DEFAULT_WEIGHT_KG, DEFAULT_AGE, "male"),
  );

  function handleUnitSystemChange(next: UnitSystem) {
    if (next === unitSystem) return;

    if (next === "us") {
      const cm = parseLocalizedNumber(heightCm);
      const kg = parseLocalizedNumber(weightKg);
      if (!Number.isNaN(cm)) {
        const { feet, inches } = cmToFeetInches(cm);
        setHeightFt(String(feet));
        setHeightIn(String(inches));
      }
      if (!Number.isNaN(kg)) {
        setWeightLb(String(round1(kgToLb(kg))));
      }
    } else {
      const ft = parseLocalizedNumber(heightFt);
      const inch = parseLocalizedNumber(heightIn);
      const lb = parseLocalizedNumber(weightLb);
      if (!Number.isNaN(ft) && !Number.isNaN(inch)) {
        setHeightCm(String(round1(feetInchesToCm({ feet: ft, inches: inch }))));
      }
      if (!Number.isNaN(lb)) {
        setWeightKg(String(round1(lbToKg(lb))));
      }
    }

    setUnitSystem(next);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    let heightCmValue: number;
    let weightKgValue: number;

    if (unitSystem === "metric") {
      heightCmValue = parseLocalizedNumber(heightCm);
      weightKgValue = parseLocalizedNumber(weightKg);
      if (!heightCm || !weightKg) {
        setError(t("errors.required"));
        return;
      }
    } else {
      const ft = parseLocalizedNumber(heightFt);
      const inch = parseLocalizedNumber(heightIn);
      const lb = parseLocalizedNumber(weightLb);
      if (!heightFt || !weightLb) {
        setError(t("errors.required"));
        return;
      }
      heightCmValue = Number.isNaN(ft) || Number.isNaN(inch) ? NaN : feetInchesToCm({ feet: ft, inches: inch || 0 });
      weightKgValue = lbToKg(lb);
    }

    const ageValue = parseLocalizedNumber(age);

    if (!age) {
      setError(t("errors.ageRequired"));
      return;
    }
    if (Number.isNaN(ageValue)) {
      setError(t("errors.ageInvalid"));
      return;
    }
    if (ageValue < 2 || ageValue > 120) {
      setError(t("errors.ageRange"));
      return;
    }
    if (Number.isNaN(heightCmValue) || Number.isNaN(weightKgValue)) {
      setError(t("errors.invalid"));
      return;
    }
    if (heightCmValue < 50 || heightCmValue > 250) {
      setError(unitSystem === "metric" ? t("errors.heightRange") : t("errors.heightRangeUS"));
      return;
    }
    if (weightKgValue < 1 || weightKgValue > 500) {
      setError(unitSystem === "metric" ? t("errors.weightRange") : t("errors.weightRangeUS"));
      return;
    }

    setResult(buildExtendedResult(heightCmValue, weightKgValue, ageValue, gender));
    setDigitStyle(
      resolveDigitStyle(unitSystem === "metric" ? heightCm : heightFt, unitSystem === "metric" ? weightKg : weightLb, age),
    );
  }

  function handleReset() {
    setUnitSystem("metric");
    setHeightCm(String(DEFAULT_HEIGHT_CM));
    setWeightKg(String(DEFAULT_WEIGHT_KG));
    setHeightFt(String(cmToFeetInches(DEFAULT_HEIGHT_CM).feet));
    setHeightIn(String(cmToFeetInches(DEFAULT_HEIGHT_CM).inches));
    setWeightLb(String(round1(kgToLb(DEFAULT_WEIGHT_KG))));
    setAge(String(DEFAULT_AGE));
    setGender("male");
    setError("");
    setDigitStyle("western");
    setResult(buildExtendedResult(DEFAULT_HEIGHT_CM, DEFAULT_WEIGHT_KG, DEFAULT_AGE, "male"));
  }

  return (
    <>
      <ToolAboveFold
        input={
          <div className="flex flex-col gap-4">
            <BMIInputPanel
              unitSystem={unitSystem}
              onUnitSystemChange={handleUnitSystemChange}
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
              error={error}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
            <BMIQuickInsight result={result} />
          </div>
        }
        result={
          <div className="flex flex-col gap-4">
            <BMIResult
              result={result}
              digitStyle={digitStyle}
              unitSystem={unitSystem}
              heightCm={heightCm}
              weightKg={weightKg}
              heightFt={heightFt}
              heightIn={heightIn}
              weightLb={weightLb}
              age={age}
              gender={gender}
            />
            <BMIMiniConverter />
          </div>
        }
        sidebar={<RelatedToolsSidebar currentSlug="bmi-calculator" category="calculators" />}
        secondary={<BMIRecommendations category={result.category} />}
      />

      {education}
    </>
  );
}
