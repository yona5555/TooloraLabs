"use client";

import { useState } from "react";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import { calculateSalesTax } from "./sales-tax";
import SalesTaxResult from "./SalesTaxResult";
import type { SalesTaxResult as Result } from "./types";

export default function SalesTaxCalculator() {
  const [price, setPrice] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function handleCalculate() {
    const p = parseFloat(price);
    const t = parseFloat(taxRate);

    if (isNaN(p) || isNaN(t)) return;

    setResult(calculateSalesTax(p, t));
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <ToolInput
        type="text" inputMode="decimal"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <ToolInput
        type="text" inputMode="decimal"
        placeholder="Sales Tax (%)"
        value={taxRate}
        onChange={(e) => setTaxRate(e.target.value)}
      />

      <ToolButton onClick={handleCalculate}>
        Calculate
      </ToolButton>

      <SalesTaxResult result={result} />
    </div>
  );
}
