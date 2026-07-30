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
  const tErrors = useTranslations("tools.sales-tax-calculator.errors");
  const [price, setPrice] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  function handleCalculate() {
    setError("");
    setResult(null);

    const p = parseLocalizedNumber(price);
    const rate = parseLocalizedNumber(taxRate);
    if (Number.isNaN(p) || Number.isNaN(rate)) {
      setError(tErrors("required"));
      return;
    }
    if (p <= 0 || p > 1_000_000) {
      setError(tErrors("priceRange"));
      return;
    }
    if (rate < 0 || rate > 100) {
      setError(tErrors("taxRange"));
      return;
    }

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
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}
      <ToolButton onClick={handleCalculate}>{t("calculate")}</ToolButton>
      <SalesTaxResult result={result} digitStyle={digitStyle} />
    </div>
  );
}
