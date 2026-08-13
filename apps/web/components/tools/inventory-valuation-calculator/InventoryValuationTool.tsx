"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { InventoryValuationCalculator } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import InventoryInputPanel from "./InventoryInputPanel";
import InventoryResult from "./InventoryResult";
import InventoryMethodReference from "./InventoryMethodReference";
import { emptyItem, type DraftItem } from "./types";

const tool = new InventoryValuationCalculator();

export default function InventoryValuationTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.inventory-valuation-calculator.errors");
  const tNav = useTranslations("tools.inventory-valuation-calculator.nav");

  const [items, setItems] = useState<DraftItem[]>([emptyItem()]);

  const digitStyle: DigitStyle = resolveDigitStyle(
    ...items.flatMap((item) => [
      item.unitsSold,
      item.reorderThreshold,
      ...item.batches.flatMap((b) => [b.quantity, b.unitCost]),
    ])
  );

  const { result, errorKey } = useMemo(() => {
    const hasAnyContent = items.some(
      (item) => item.name.trim() || item.batches.some((b) => b.quantity.trim() || b.unitCost.trim())
    );
    if (!hasAnyContent) return { result: null, errorKey: "" };

    const parsedItems = items
      .filter((item) => item.name.trim())
      .map((item) => ({
        name: item.name,
        batches: item.batches
          .filter((b) => b.quantity.trim() || b.unitCost.trim())
          .map((b) => ({
            quantity: parseLocalizedNumber(b.quantity) || 0,
            unitCost: parseLocalizedNumber(b.unitCost) || 0,
          })),
        unitsSold: item.unitsSold.trim() ? parseLocalizedNumber(item.unitsSold) : undefined,
        reorderThreshold: item.reorderThreshold.trim()
          ? parseLocalizedNumber(item.reorderThreshold)
          : undefined,
      }));

    if (parsedItems.length === 0) return { result: null, errorKey: "" };

    const output = tool.execute({ items: parsedItems }, { locale: "en-US" });
    if (!output.success) {
      const key = output.metadata.error === "EMPTY_ITEMS" ? "emptyItems" : "invalidItem";
      return { result: null, errorKey: key };
    }

    return { result: output.data, errorKey: "" };
  }, [items]);

  const errorMessage = errorKey ? t(errorKey) : "";

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<InventoryInputPanel items={items} onItemsChange={setItems} />}
          result={<InventoryResult result={result} errorMessage={errorMessage} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="inventory-valuation-calculator" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <InventoryMethodReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
