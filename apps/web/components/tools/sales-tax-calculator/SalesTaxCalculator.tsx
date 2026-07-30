"use client";

import { useState } from "react";
import { parseLocalizedNumber } from "@tooloralabs/core";
import { SalesTaxCalculator as SalesTaxCalculatorTool } from "@tooloralabs/tools";

import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import SalesTaxResult from "./SalesTaxResult";
import type { SalesTaxResult as Result } from "./types";

const tool = new SalesTaxCalculatorTool();

export default function SalesTaxCalculator() {
  const [price, setPrice] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function handleCalculate() {
    const p = parseLocalizedNumber(price);
    const t = parseLocalizedNumber(taxRate);
    if (Number.isNaN(p) || Number.isNaN(t)) return;
    const output = tool.execute({ price: p, taxRate: t }, { locale: "en-US" });
    setResult(output.data);
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <ToolInput
        type="text"
        inputMode="decimal"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <ToolInput
        type="text"
        inputMode="decimal"
        placeholder="Sales Tax (%)"
        value={taxRate}
        onChange={(e) => setTaxRate(e.target.value)}
      />
      <ToolButton onClick={handleCalculate}>Calculate</ToolButton>
      <SalesTaxResult result={result} />
    </div>
  );
}
