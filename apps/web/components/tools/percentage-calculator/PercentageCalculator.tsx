"use client";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PercentageCalculator as PercentageCalculatorTool } from "@tooloralabs/tools";

import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import PercentageResult from "./PercentageResult";
import type {
  PercentageMode,
  PercentageResult as Result,
} from "./types";

const tool = new PercentageCalculatorTool();

type Computed = {
  mode: PercentageMode;
  first: number;
  second: number;
};

export default function PercentageCalculator() {
  const t = useTranslations("tools.percentage-calculator.form");
  const [mode, setMode] = useState<PercentageMode>("percent-of-number");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [computed, setComputed] = useState<Computed | null>(null);

  function handleCalculate() {
    const a = parseLocalizedNumber(first);
    const b = parseLocalizedNumber(second);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      return;
    }
    const output = tool.execute({ mode, first: a, second: b }, { locale: "en-US" });
    setResult(output.data);
    setComputed({ mode, first: a, second: b });
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as PercentageMode)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3"
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
      <ToolButton onClick={handleCalculate}>{t("calculate")}</ToolButton>
      <PercentageResult result={result} computed={computed} />
    </div>
  );
}
