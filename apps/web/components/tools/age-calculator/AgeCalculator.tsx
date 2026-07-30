"use client";

import { useState } from "react";
import { AgeCalculator as AgeCalculatorTool } from "@tooloralabs/tools";

import ToolButton from "@/components/tool-ui/ToolButton";
import ToolCard from "@/components/tool-ui/ToolCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import AgeResult from "./AgeResult";
import type { AgeResult as AgeResultType } from "./types";

const tool = new AgeCalculatorTool();

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AgeResultType | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!birthDate) {
      setError("Please select your birth date.");
      return;
    }
    const date = new Date(birthDate);
    if (Number.isNaN(date.getTime())) {
      setError("Invalid date.");
      return;
    }
    if (date > new Date()) {
      setError("Birth date cannot be in the future.");
      return;
    }

    const output = tool.execute({ birthDate }, { locale: "en-US" });
    setResult(output.data);
  }

  function handleReset() {
    setBirthDate("");
    setResult(null);
    setError("");
  }

  return (
    <ToolCard
      title="Age Calculator"
      description="Calculate your exact age in years, months and days."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <ToolInput
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}
        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">Calculate Age</ToolButton>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold transition hover:bg-zinc-100"
          >
            Reset
          </button>
        </div>
        {result && <AgeResult result={result} />}
      </form>
    </ToolCard>
  );
}
