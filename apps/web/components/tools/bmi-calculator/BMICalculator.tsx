"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BMICalculator as BMICalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolCard from "@/components/tool-ui/ToolCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import BMIResult from "./BMIResult";
import type { BMIResult as BMIResultType } from "./types";

const tool = new BMICalculatorTool();

export default function BMICalculator() {
  const t = useTranslations("tools.bmi-calculator");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<BMIResultType | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);

    const heightCm = parseLocalizedNumber(height);
    const weightKg = parseLocalizedNumber(weight);

    if (!height || !weight) {
      setError(t("errors.required"));
      return;
    }
    if (
      Number.isNaN(heightCm) ||
      Number.isNaN(weightKg) ||
      heightCm <= 0 ||
      weightKg <= 0
    ) {
      setError(t("errors.invalid"));
      return;
    }

    const output = tool.execute({ heightCm, weightKg }, { locale: "en-US" });
    setResult(output.data);
    setDigitStyle(resolveDigitStyle(height, weight));
  }

  function handleReset() {
    setHeight("");
    setWeight("");
    setError("");
    setResult(null);
  }

  return (
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
        {result && <BMIResult result={result} digitStyle={digitStyle} />}
      </form>
    </ToolCard>
  );
}
