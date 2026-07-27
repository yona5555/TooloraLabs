"use client";

import { useState } from "react";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import DiscountResult from "./DiscountResult";
import { calculateDiscount } from "./discount";
import type { DiscountResult as Result } from "./types";

export default function DiscountCalculator() {
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function handleCalculate() {
    const originalPrice = Number(price);
    const discountPercent = Number(discount);

    if (
      Number.isNaN(originalPrice) ||
      Number.isNaN(discountPercent)
    ) {
      return;
    }

    setResult(calculateDiscount(originalPrice, discountPercent));
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Discount Calculator</h1>

      <div className="mt-8 space-y-4">
        <ToolInput
          type="number"
          placeholder="Original Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <ToolInput
          type="number"
          placeholder="Discount (%)"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />

        <ToolButton onClick={handleCalculate}>
          Calculate
        </ToolButton>
      </div>

      <DiscountResult result={result} />
    </div>
  );
}
