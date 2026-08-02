"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BMICalculator as BMICalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolCard from "@/components/tool-ui/ToolCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import BMIResult from "./BMIResult";
import BMIRecommendations from "./BMIRecommendations";
import BMIRelatedSidebar from "./BMIRelatedSidebar";
import BMIEducation from "./BMIEducation";
import type { BMIResult as BMIResultType } from "./types";

const tool = new BMICalculatorTool();
const DEFAULT_HEIGHT_CM = 170;
const DEFAULT_WEIGHT_KG = 70;

export default function BMICalculator() {
  const t = useTranslations("tools.bmi-calculator");
  const [height, setHeight] = useState(String(DEFAULT_HEIGHT_CM));
  const [weight, setWeight] = useState(String(DEFAULT_WEIGHT_KG));
  const [error, setError] = useState("");
  const [result, setResult] = useState<BMIResultType>(
    () => tool.execute({ heightCm: DEFAULT_HEIGHT_CM, weightKg: DEFAULT_WEIGHT_KG }, { locale: "en-US" }).data,
  );
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const heightCm = parseLocalizedNumber(height);
    const weightKg = parseLocalizedNumber(weight);

    if (!height || !weight) {
      setError(t("errors.required"));
      return;
    }
    if (Number.isNaN(heightCm) || Number.isNaN(weightKg)) {
      setError(t("errors.invalid"));
      return;
    }
    if (heightCm < 50 || heightCm > 250) {
      setError(t("errors.heightRange"));
      return;
    }
    if (weightKg < 1 || weightKg > 500) {
      setError(t("errors.weightRange"));
      return;
    }

    const output = tool.execute({ heightCm, weightKg }, { locale: "en-US" });
    setResult(output.data);
    setDigitStyle(resolveDigitStyle(height, weight));
  }

  function handleReset() {
    setHeight(String(DEFAULT_HEIGHT_CM));
    setWeight(String(DEFAULT_WEIGHT_KG));
    setError("");
    setDigitStyle("western");
    setResult(
      tool.execute({ heightCm: DEFAULT_HEIGHT_CM, weightKg: DEFAULT_WEIGHT_KG }, { locale: "en-US" }).data,
    );
  }

  return (
    <>
      <ToolAboveFold
        input={
          <ToolCard title={t("title")} description={t("description")}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <ToolInput
                type="text" inputMode="decimal"
                placeholder={t("form.heightPlaceholder")}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <ToolInput
                type="text" inputMode="decimal"
                placeholder={t("form.weightPlaceholder")}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                <ToolButton type="submit">{t("form.calculate")}</ToolButton>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t("form.reset")}
                </button>
              </div>
            </form>
          </ToolCard>
        }
        result={<BMIResult result={result} digitStyle={digitStyle} />}
        sidebar={<BMIRelatedSidebar />}
      />

      <div className="mt-6">
        <BMIRecommendations category={result.category} />
      </div>

      <BMIEducation />
    </>
  );
}
