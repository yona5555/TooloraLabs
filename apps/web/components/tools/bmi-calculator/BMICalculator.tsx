"use client";

import { useState } from "react";

import ToolButton from "@/components/tool-ui/ToolButton";
import ToolCard from "@/components/tool-ui/ToolCard";
import ToolInput from "@/components/tool-ui/ToolInput";

import { calculateBMI } from "./bmi";
import BMIResult from "./BMIResult";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateBMI> | null>(
    null
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setResult(null);

    const heightCm = Number(height);
    const weightKg = Number(weight);

    if (!height || !weight) {
      setError("Please enter your height and weight.");
      return;
    }

    if (
      Number.isNaN(heightCm) ||
      Number.isNaN(weightKg) ||
      heightCm <= 0 ||
      weightKg <= 0
    ) {
      setError("Height and weight must be greater than zero.");
      return;
    }

    setResult(calculateBMI(heightCm, weightKg));
  }

  function handleReset() {
    setHeight("");
    setWeight("");
    setError("");
    setResult(null);
  }

  return (
    <ToolCard
      title="BMI Calculator"
      description="Calculate your Body Mass Index (BMI) and healthy weight range."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <ToolInput
          type="number"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />

        <ToolInput
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">
            Calculate BMI
          </ToolButton>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold transition hover:bg-zinc-100"
          >
            Reset
          </button>
        </div>

        {result && <BMIResult result={result} />}
      </form>
    </ToolCard>
  );
}
