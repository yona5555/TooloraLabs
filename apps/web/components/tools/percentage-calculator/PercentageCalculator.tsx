"use client";

import { useState } from "react";

import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";

import PercentageResult from "./PercentageResult";
import { calculatePercentage } from "./percentage";
import type {
  PercentageMode,
  PercentageResult as Result,
} from "./types";

export default function PercentageCalculator() {
  const [mode, setMode] =
    useState<PercentageMode>("percent-of-number");

  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function handleCalculate() {
    const a = Number(first);
    const b = Number(second);

    if (Number.isNaN(a) || Number.isNaN(b)) {
      return;
    }

    setResult(calculatePercentage(mode, a, b));
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <select
        value={mode}
        onChange={(e) =>
          setMode(e.target.value as PercentageMode)
        }
        className="w-full rounded-xl border border-zinc-300 px-4 py-3"
      >
        <option value="percent-of-number">
          X% of Y
        </option>

        <option value="what-percent">
          X is what % of Y
        </option>

        <option value="percentage-change">
          Percentage Change
        </option>
      </select>

      <ToolInput
        type="number"
        placeholder="First value"
        value={first}
        onChange={(e) => setFirst(e.target.value)}
      />

      <ToolInput
        type="number"
        placeholder="Second value"
        value={second}
        onChange={(e) => setSecond(e.target.value)}
      />

      <ToolButton onClick={handleCalculate}>
        Calculate
      </ToolButton>

      <PercentageResult result={result} />
    </div>
  );
}
