"use client";

import { useState } from "react";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import { calculateTip } from "./tip";
import TipResult from "./TipResult";
import type { TipResult as Result } from "./types";

export default function TipCalculator() {
  const [bill, setBill] = useState("");
  const [tip, setTip] = useState("15");
  const [people, setPeople] = useState("1");
  const [result, setResult] = useState<Result | null>(null);

  function handleCalculate() {
    const billValue = Number(bill);
    const tipValue = Number(tip);
    const peopleValue = Number(people);

    if (
      Number.isNaN(billValue) ||
      Number.isNaN(tipValue) ||
      Number.isNaN(peopleValue) ||
      billValue < 0 ||
      tipValue < 0 ||
      peopleValue <= 0
    ) {
      setResult(null);
      return;
    }

    setResult(calculateTip(billValue, tipValue, peopleValue));
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <ToolInput
        type="number"
        placeholder="Bill Amount"
        value={bill}
        onChange={(e) => setBill(e.target.value)}
      />

      <ToolInput
        type="number"
        placeholder="Tip Percentage"
        value={tip}
        onChange={(e) => setTip(e.target.value)}
      />

      <ToolInput
        type="number"
        placeholder="Number of People"
        value={people}
        onChange={(e) => setPeople(e.target.value)}
      />

      <ToolButton onClick={handleCalculate}>
        Calculate Tip
      </ToolButton>

      <TipResult result={result} />
    </div>
  );
}
