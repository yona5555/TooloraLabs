"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { DiscountCalculator as DiscountCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import DiscountInputPanel from "./DiscountInputPanel";
import DiscountResult from "./DiscountResult";
import DiscountStackingReference from "./DiscountStackingReference";
import type { DiscountMode } from "./types";

const tool = new DiscountCalculatorTool();

export default function DiscountCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.discount-calculator.nav");

  const [mode, setMode] = useState<DiscountMode>("apply");
  const [price, setPrice] = useState("120");
  const [discounts, setDiscounts] = useState<string[]>(["30", "10"]);

  function handleModeChange(next: DiscountMode) {
    if (next === mode) return;
    setMode(next);
    setDiscounts(next === "reverse" ? [discounts[0] ?? "30"] : ["30", "10"]);
    setPrice(next === "reverse" ? "84" : "120");
  }

  const digitStyle: DigitStyle = resolveDigitStyle(price, ...discounts);

  const result = useMemo(() => {
    const priceValue = parseLocalizedNumber(price) || 0;
    const discountValues = discounts.map((d) => parseLocalizedNumber(d) || 0);
    const output = tool.execute(
      {
        mode,
        originalPrice: mode === "apply" ? priceValue : 0,
        finalPrice: mode === "reverse" ? priceValue : 0,
        discounts: discountValues,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [mode, price, discounts]);

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
            <DiscountInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              price={price}
              onPriceChange={setPrice}
              discounts={discounts}
              onDiscountsChange={setDiscounts}
            />
          }
          result={<DiscountResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="discount-calculator" category="business-finance" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <DiscountStackingReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
