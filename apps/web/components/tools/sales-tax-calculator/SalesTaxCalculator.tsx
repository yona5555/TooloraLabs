"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { SalesTaxCalculator as SalesTaxCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import SalesTaxResult from "./SalesTaxResult";
import type { SalesTaxResult as Result } from "./types";

const tool = new SalesTaxCalculatorTool();

export default function SalesTaxCalculator() {
  const t = useTranslations("tools.sales-tax-calculator.form");
  const [price, setPrice] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  function handleCalculate() {
    const p = parseLocalizedNumber(price);
    const rate = parseLocalizedNumber(taxRate);
    if (Number.isNaN(p) || Number.isNaN(rate)) return;
    const output = tool.execute({ price: p, taxRate: rate }, { locale: "en-US" });
    setResult(output.data);
    setDigitStyle(resolveDigitStyle(price, taxRate));
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <ToolInput
        type="text"
        inputMode="decimal"
        placeholder={t("pricePlaceholder")}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <ToolInput
        type="text"
        inputMode="decimal"
        placeholder={t("taxRatePlaceholder")}
        value={taxRate}
        onChange={(e) => setTaxRate(e.target.value)}
      />
      <ToolButton onClick={handleCalculate}>{t("calculate")}</ToolButton>
      <SalesTaxResult result={result} digitStyle={digitStyle} />
    </div>
  );
}
