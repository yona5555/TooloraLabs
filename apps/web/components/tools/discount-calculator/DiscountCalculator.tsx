"use client";

import { useState } from "react";
import { DiscountCalculator as DiscountCalculatorTool } from "@tooloralabs/tools";

import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import DiscountResult from "./DiscountResult";
import type { DiscountResult as Result } from "./types";

const tool = new DiscountCalculatorTool();

export default function DiscountCalculator() {
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function handleCalculate() {
    const originalPrice = Number(price);
    const discountPercent = Number(discount);
    if (Number.isNaN(originalPrice) || Number.isNaN(discountPercent)) {
      return;
    }
    const output = tool.execute({ originalPrice, discountPercent }, { locale: "en-US" });
    setResult(output.data);
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <ToolInput
        type="number"
        placeholder="Original price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <ToolInput
        type="number"
        placeholder="Discount %"
        value={discount}
        onChange={(e) => setDiscount(e.target.value)}
      />
      <ToolButton onClick={handleCalculate}>Calculate Discount</ToolButton>
      {result && <DiscountResult result={result} />}
    </div>
  );
}
