"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { InventoryValuationCalculator, type InventoryValuationOutput } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionCard from "@/components/tool-ui/SectionCard";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import InventoryInputPanel from "./InventoryInputPanel";
import InventoryResult from "./InventoryResult";
import InventoryMethodReference from "./InventoryMethodReference";
import InventoryStockLevelBarDiagram from "./InventoryStockLevelBarDiagram";
import InventoryPerItemCompositionBar from "./InventoryPerItemCompositionBar";
import { emptyItem, type DraftItem } from "./types";

const RELATED_TOOLS = ["break-even-calculator", "invoice-generator", "fuel-cost-calculator"];

const tool = new InventoryValuationCalculator();

const DEFAULT_ITEMS: DraftItem[] = [
  { name: "Widget A", unitsSold: "80", reorderThreshold: "20", batches: [{ quantity: "100", unitCost: "5" }, { quantity: "60", unitCost: "6" }] },
  { name: "Widget B", unitsSold: "45", reorderThreshold: "15", batches: [{ quantity: "50", unitCost: "12" }] },
];

type ComputeOutcome = { result: InventoryValuationOutput | null; errorKey: string };

function computeResult(items: DraftItem[]): ComputeOutcome {
  const hasAnyContent = items.some((item) => item.name.trim() || item.batches.some((b) => b.quantity.trim() || b.unitCost.trim()));
  if (!hasAnyContent) return { result: null, errorKey: "" };

  const parsedItems = items
    .filter((item) => item.name.trim())
    .map((item) => ({
      name: item.name,
      batches: item.batches
        .filter((b) => b.quantity.trim() || b.unitCost.trim())
        .map((b) => ({ quantity: parseLocalizedNumber(b.quantity) || 0, unitCost: parseLocalizedNumber(b.unitCost) || 0 })),
      unitsSold: item.unitsSold.trim() ? parseLocalizedNumber(item.unitsSold) : undefined,
      reorderThreshold: item.reorderThreshold.trim() ? parseLocalizedNumber(item.reorderThreshold) : undefined,
    }));

  if (parsedItems.length === 0) return { result: null, errorKey: "" };

  const output = tool.execute({ items: parsedItems }, { locale: "en-US" });
  if (!output.success) {
    const key = output.metadata.error === "EMPTY_ITEMS" ? "emptyItems" : "invalidItem";
    return { result: null, errorKey: key };
  }

  return { result: output.data, errorKey: "" };
}

export default function InventoryValuationTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.inventory-valuation-calculator.errors");
  const tDiagrams = useTranslations("tools.inventory-valuation-calculator");
  const tNav = useTranslations("tools.inventory-valuation-calculator.nav");

  const [items, setItems] = useState<DraftItem[]>(DEFAULT_ITEMS);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const [outcome, setOutcome] = useState<ComputeOutcome>(() => computeResult(DEFAULT_ITEMS));
  const [hasCalculated, setHasCalculated] = useState(true);

  const [navBarVisible, setNavBarVisible] = useState(false);
  const headerSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerSentinelRef.current;
    if (!el) return;

    let isVisible = false;

    const showObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !isVisible) {
          isVisible = true;
          setNavBarVisible(true);
        }
      },
      { rootMargin: "-88px 0px 0px 0px", threshold: 0 }
    );
    const hideObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isVisible) {
          isVisible = false;
          setNavBarVisible(false);
        }
      },
      { rootMargin: "-56px 0px 0px 0px", threshold: 0 }
    );

    showObserver.observe(el);
    hideObserver.observe(el);
    return () => {
      showObserver.disconnect();
      hideObserver.disconnect();
    };
  }, []);

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOutcome(computeResult(items));
    setHasCalculated(true);
    setDigitStyle(resolveDigitStyle(...items.flatMap((item) => [item.unitsSold, item.reorderThreshold, ...item.batches.flatMap((b) => [b.quantity, b.unitCost])])));
  }

  function handleClear() {
    setItems([emptyItem()]);
    setCurrency(DEFAULT_CURRENCY);
    setDigitStyle("western");
    setHasCalculated(false);
  }

  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    const convertedItems = items.map((item) => ({
      ...item,
      batches: item.batches.map((b) => ({ ...b, unitCost: convertAmountString(b.unitCost, currency, next, (raw) => parseLocalizedNumber(raw) || 0) })),
    }));
    setItems(convertedItems);
    setCurrency(next);

    if (hasCalculated) {
      setOutcome(computeResult(convertedItems));
    }
  }

  const errorMessage = outcome.errorKey ? t(outcome.errorKey) : "";
  const result = outcome.result;

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const stockLevelItems = result
    ? result.items.map((item) => ({ label: item.name, endingUnits: item.endingUnits, belowThreshold: item.belowThreshold }))
    : null;
  const compositionItems = result ? result.items.map((item) => ({ label: item.name, unitsSold: item.unitsSold, endingUnits: item.endingUnits })) : null;

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <div className="flex flex-col gap-3">
              <InventoryInputPanel
                currency={currency}
                onCurrencyChange={handleCurrencyChange}
                items={items}
                onItemsChange={setItems}
                onCalculate={handleCalculate}
                onClear={handleClear}
              />
            </div>
          }
          result={
            <div className="flex flex-col gap-4">
              <InventoryResult result={result} hasCalculated={hasCalculated} errorMessage={errorMessage} digitStyle={digitStyle} currency={currency} />

              <InventoryMethodReference />

              {hasCalculated && stockLevelItems && stockLevelItems.length > 0 && (
                <SectionCard title={tDiagrams("stockLevelDiagram.title")}>
                  <InventoryStockLevelBarDiagram items={stockLevelItems} caption={tDiagrams("stockLevelDiagram.caption")} />
                </SectionCard>
              )}

              {hasCalculated && compositionItems && compositionItems.length > 0 && (
                <SectionCard title={tDiagrams("compositionDiagram.title")}>
                  <InventoryPerItemCompositionBar
                    items={compositionItems}
                    soldLabel={tDiagrams("compositionDiagram.soldLabel")}
                    endingLabel={tDiagrams("compositionDiagram.endingLabel")}
                    caption={tDiagrams("compositionDiagram.caption")}
                  />
                </SectionCard>
              )}
            </div>
          }
          sidebar={
            <RelatedToolsSidebar
              currentSlug="inventory-valuation-calculator"
              category="business-finance"
              relatedList={RELATED_TOOLS}
              relatedListTitle={tDiagrams("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <ViewDocsLink slug="inventory-valuation-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
