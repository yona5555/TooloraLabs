"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PercentageCalculator as PercentageCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import PercentageResult from "./PercentageResult";
import type {
  PercentageMode,
  PercentageResult as Result,
} from "./types";

const tool = new PercentageCalculatorTool();
const MAX_MAGNITUDE = 1_000_000_000;

type Computed = {
  mode: PercentageMode;
  first: number;
  second: number;
  digitStyle: DigitStyle;
};

export default function PercentageCalculator() {
  const t = useTranslations("tools.percentage-calculator.form");
  const tErrors = useTranslations("tools.percentage-calculator.errors");
  const [mode, setMode] = useState<PercentageMode>("percent-of-number");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [computed, setComputed] = useState<Computed | null>(null);

  function handleCalculate() {
    setError("");
    setResult(null);

    const a = parseLocalizedNumber(first);
    const b = parseLocalizedNumber(second);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      setError(tErrors("required"));
      return;
    }
    if (Math.abs(a) > MAX_MAGNITUDE || Math.abs(b) > MAX_MAGNITUDE) {
      setError(tErrors("outOfRange"));
      return;
    }

    const output = tool.execute({ mode, first: a, second: b }, { locale: "en-US" });
    setResult(output.data);
    setComputed({ mode, first: a, second: b, digitStyle: resolveDigitStyle(first, second) });
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as PercentageMode)}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      >
        <option value="percent-of-number">{t("modePercentOf")}</option>
        <option value="what-percent">{t("modeWhatPercent")}</option>
        <option value="percentage-change">{t("modePercentageChange")}</option>
      </select>
      <ToolInput
        type="text" inputMode="decimal"
        placeholder={t("firstPlaceholder")}
        value={first}
        onChange={(e) => setFirst(e.target.value)}
      />
      <ToolInput
        type="text" inputMode="decimal"
        placeholder={t("secondPlaceholder")}
        value={second}
        onChange={(e) => setSecond(e.target.value)}
      />
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}
      <ToolButton onClick={handleCalculate}>{t("calculate")}</ToolButton>
      <PercentageResult result={result} computed={computed} />
    </div>
  );
}
