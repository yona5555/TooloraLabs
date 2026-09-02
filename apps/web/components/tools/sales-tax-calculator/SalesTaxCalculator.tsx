"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { SalesTaxCalculator as SalesTaxCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import SalesTaxInputPanel from "./SalesTaxInputPanel";
import SalesTaxResult from "./SalesTaxResult";
import SalesTaxRatesReference from "./SalesTaxRatesReference";
import type { SalesTaxMode } from "./types";

const tool = new SalesTaxCalculatorTool();

export default function SalesTaxCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.sales-tax-calculator.nav");

  const [mode, setMode] = useState<SalesTaxMode>("add");
  const [price, setPrice] = useState("100");
  const [taxRate, setTaxRate] = useState("8");

  function handleModeChange(next: SalesTaxMode) {
    if (next === mode) return;
    setMode(next);
    setPrice(next === "reverse" ? "108" : "100");
  }

  const digitStyle: DigitStyle = resolveDigitStyle(price, taxRate);

  const result = useMemo(() => {
    const priceValue = parseLocalizedNumber(price) || 0;
    const rateValue = parseLocalizedNumber(taxRate) || 0;
    const output = tool.execute(
      {
        mode,
        price: mode === "add" ? priceValue : 0,
        totalPrice: mode === "reverse" ? priceValue : 0,
        taxRate: rateValue,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [mode, price, taxRate]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <SalesTaxInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              price={price}
              onPriceChange={setPrice}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
            />
          }
          result={<SalesTaxResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="sales-tax-calculator" category="business-finance" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <SalesTaxRatesReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
