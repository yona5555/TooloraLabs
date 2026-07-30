"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DiscountCalculator as DiscountCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import DiscountResult from "./DiscountResult";
import type { DiscountResult as Result } from "./types";

const tool = new DiscountCalculatorTool();

export default function DiscountCalculator() {
  const t = useTranslations("tools.discount-calculator.form");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  function handleCalculate() {
    const originalPrice = parseLocalizedNumber(price);
    const discountPercent = parseLocalizedNumber(discount);
    if (Number.isNaN(originalPrice) || Number.isNaN(discountPercent)) {
      return;
    }
    const output = tool.execute({ originalPrice, discountPercent }, { locale: "en-US" });
    setResult(output.data);
    setDigitStyle(resolveDigitStyle(price, discount));
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <ToolInput
        type="text" inputMode="decimal"
        placeholder={t("pricePlaceholder")}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <ToolInput
        type="text" inputMode="decimal"
        placeholder={t("discountPlaceholder")}
        value={discount}
        onChange={(e) => setDiscount(e.target.value)}
      />
      <ToolButton onClick={handleCalculate}>{t("calculate")}</ToolButton>
      {result && <DiscountResult result={result} digitStyle={digitStyle} />}
    </div>
  );
}
