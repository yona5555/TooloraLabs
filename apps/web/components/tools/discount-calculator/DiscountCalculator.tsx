"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DiscountCalculator as DiscountCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import PrintButton from "@/components/tool-ui/PrintButton";
import { usePrintExport } from "@/hooks/usePrintExport";
import DiscountResult from "./DiscountResult";
import type { DiscountResult as Result } from "./types";

const tool = new DiscountCalculatorTool();

export default function DiscountCalculator() {
  const t = useTranslations("tools.discount-calculator.form");
  const tErrors = useTranslations("tools.discount-calculator.errors");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const { printRef, handlePrint } = usePrintExport<HTMLDivElement>();

  function handleCalculate() {
    setError("");
    setResult(null);

    const originalPrice = parseLocalizedNumber(price);
    const discountPercent = parseLocalizedNumber(discount);
    if (Number.isNaN(originalPrice) || Number.isNaN(discountPercent)) {
      setError(tErrors("required"));
      return;
    }
    if (originalPrice <= 0 || originalPrice > 1_000_000) {
      setError(tErrors("priceRange"));
      return;
    }
    if (discountPercent < 0 || discountPercent > 100) {
      setError(tErrors("discountRange"));
      return;
    }

    const output = tool.execute({ originalPrice, discountPercent }, { locale: "en-US" });
    setResult(output.data);
    setDigitStyle(resolveDigitStyle(price, discount));
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
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
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}
      <ToolButton onClick={handleCalculate}>{t("calculate")}</ToolButton>
      {result && (
        <div ref={printRef} data-print-area className="space-y-6">
          <div className="flex justify-end print:hidden">
            <PrintButton onPrint={handlePrint} />
          </div>
          <DiscountResult result={result} digitStyle={digitStyle} />
        </div>
      )}
    </div>
  );
}
