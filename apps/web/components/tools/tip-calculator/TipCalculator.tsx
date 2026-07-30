"use client";

import { useState } from "react";
import { TipCalculator as TipCalculatorTool } from "@tooloralabs/tools";

import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import TipResult from "./TipResult";
import type { TipResult as Result } from "./types";

const tool = new TipCalculatorTool();

export default function TipCalculator() {
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState("");
  const [people, setPeople] = useState("1");
  const [result, setResult] = useState<Result | null>(null);

  function handleCalculate() {
    const billAmount = Number(bill);
    const tip = Number(tipPercent);
    const peopleCount = Number(people);
    if (Number.isNaN(billAmount) || Number.isNaN(tip) || Number.isNaN(peopleCount)) {
      return;
    }
    const output = tool.execute(
      { billAmount, tipPercent: tip, people: peopleCount },
      { locale: "en-US" }
    );
    setResult(output.data);
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <ToolInput
        type="text" inputMode="decimal"
        placeholder="Bill amount"
        value={bill}
        onChange={(e) => setBill(e.target.value)}
      />
      <ToolInput
        type="text" inputMode="decimal"
        placeholder="Tip %"
        value={tipPercent}
        onChange={(e) => setTipPercent(e.target.value)}
      />
      <ToolInput
        type="text" inputMode="decimal"
        placeholder="Number of people"
        value={people}
        onChange={(e) => setPeople(e.target.value)}
      />
      <ToolButton onClick={handleCalculate}>Calculate Tip</ToolButton>
      {result && <TipResult result={result} />}
    </div>
  );
}
