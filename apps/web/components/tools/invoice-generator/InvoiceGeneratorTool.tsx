"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { InvoiceGenerator } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionCard from "@/components/tool-ui/SectionCard";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { usePrintExport } from "@/hooks/usePrintExport";
import InvoiceInputPanel, { type DraftLine } from "./InvoiceInputPanel";
import InvoicePreview from "./InvoicePreview";
import InvoiceChecklistReference from "./InvoiceChecklistReference";
import InvoiceLineItemsBarDiagram from "./InvoiceLineItemsBarDiagram";
import InvoiceRunningTotalWaterfall from "./InvoiceRunningTotalWaterfall";
import InvoiceBeforeAfterDiscountBar from "./InvoiceBeforeAfterDiscountBar";

const tool = new InvoiceGenerator();

function emptyLine(): DraftLine {
  return { description: "", quantity: "1", unitPrice: "" };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function inDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const DEFAULT_LINES: DraftLine[] = [
  { description: "Web Design Services", quantity: "1", unitPrice: "1200" },
  { description: "Hosting (Annual)", quantity: "1", unitPrice: "150" },
];
const DEFAULT_TAX_RATE = "8";
const DEFAULT_DISCOUNT_PERCENT = "0";

export default function InvoiceGeneratorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.invoice-generator.errors");
  const tDiagrams = useTranslations("tools.invoice-generator");
  const tNav = useTranslations("tools.invoice-generator.nav");

  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-0001");
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(inDaysISO(14));
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [lines, setLines] = useState<DraftLine[]>(DEFAULT_LINES);
  const [taxRate, setTaxRate] = useState(DEFAULT_TAX_RATE);
  const [discountPercent, setDiscountPercent] = useState(DEFAULT_DISCOUNT_PERCENT);
  const [hasCalculated, setHasCalculated] = useState(true);
  const { printRef, handlePrint } = usePrintExport<HTMLDivElement>();

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

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }
  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }
  function removeLine(index: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    setLines((prev) => prev.map((line) => ({ ...line, unitPrice: convertAmountString(line.unitPrice, currency, next, (raw) => parseLocalizedNumber(raw) || 0) })));
    setCurrency(next);
  }

  function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasCalculated(true);
  }

  function handleClear() {
    setFromName("");
    setToName("");
    setInvoiceNumber("INV-0001");
    setIssueDate(todayISO());
    setDueDate(inDaysISO(14));
    setCurrency(DEFAULT_CURRENCY);
    setLines([emptyLine()]);
    setTaxRate(DEFAULT_TAX_RATE);
    setDiscountPercent(DEFAULT_DISCOUNT_PERCENT);
    setHasCalculated(false);
  }

  const digitStyle: DigitStyle = resolveDigitStyle(taxRate, discountPercent, ...lines.flatMap((l) => [l.quantity, l.unitPrice]));

  const { result, errorKey } = useMemo(() => {
    const hasAnyContent = lines.some((l) => l.description.trim() || l.unitPrice.trim());
    if (!hasAnyContent) return { result: null, errorKey: "" };

    const items = lines
      .filter((l) => l.description.trim())
      .map((line) => ({
        description: line.description,
        quantity: parseLocalizedNumber(line.quantity) || 0,
        unitPrice: parseLocalizedNumber(line.unitPrice) || 0,
      }));

    const output = tool.execute(
      {
        items,
        taxRate: parseLocalizedNumber(taxRate) || 0,
        discountPercent: parseLocalizedNumber(discountPercent) || 0,
        currency,
      },
      { locale: "en-US" }
    );

    if (!output.success) {
      const key =
        output.metadata.error === "EMPTY_ITEMS"
          ? "emptyItems"
          : output.metadata.error === "INVALID_ITEM"
            ? "invalidItem"
            : output.metadata.error === "INVALID_TAX_RATE"
              ? "invalidTaxRate"
              : "invalidDiscount";
      return { result: null, errorKey: key };
    }

    return { result: output.data, errorKey: "" };
  }, [lines, taxRate, discountPercent, currency]);

  const errorMessage = errorKey ? t(errorKey) : "";

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });

  const lineItemBars = result ? result.lines.map((l) => ({ label: l.description, value: l.total })) : null;
  const waterfallStages = result
    ? [
        { label: tDiagrams("waterfallDiagram.subtotal"), value: result.subtotal },
        { label: tDiagrams("waterfallDiagram.afterDiscount"), value: result.taxableAmount },
        { label: tDiagrams("waterfallDiagram.total"), value: result.total },
      ]
    : null;
  const showBeforeAfterDiscount = result && result.discountAmount > 0;
  const beforeDiscountTotal = result ? result.subtotal + result.taxAmount : 0;

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <InvoiceInputPanel
              fromName={fromName}
              onFromNameChange={setFromName}
              toName={toName}
              onToNameChange={setToName}
              invoiceNumber={invoiceNumber}
              onInvoiceNumberChange={setInvoiceNumber}
              issueDate={issueDate}
              onIssueDateChange={setIssueDate}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              lines={lines}
              onUpdateLine={updateLine}
              onAddLine={addLine}
              onRemoveLine={removeLine}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
              discountPercent={discountPercent}
              onDiscountPercentChange={setDiscountPercent}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          }
          result={
            hasCalculated ? (
              <InvoicePreview
                result={result}
                errorMessage={errorMessage}
                digitStyle={digitStyle}
                fromName={fromName}
                toName={toName}
                invoiceNumber={invoiceNumber}
                issueDate={issueDate}
                dueDate={dueDate}
                printRef={printRef}
                onPrint={handlePrint}
              />
            ) : (
              <SectionCard title={tDiagrams("aboveFold.resultTitle")}>
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
                  <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{tDiagrams("aboveFold.emptyStateMessage")}</p>
                </div>
              </SectionCard>
            )
          }
          sidebar={<RelatedToolsSidebar currentSlug="invoice-generator" category="business-finance" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <ViewDocsLink slug="invoice-generator" />

              {hasCalculated && lineItemBars && lineItemBars.length > 1 && (
                <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-500/30 dark:bg-zinc-900 lg:p-6">
                  <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{tDiagrams("lineItemsDiagram.title")}</h3>
                  <InvoiceLineItemsBarDiagram items={lineItemBars} formatValue={money} caption={tDiagrams("lineItemsDiagram.caption")} />
                </div>
              )}

              {hasCalculated && waterfallStages && (
                <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-500/30 dark:bg-zinc-900 lg:p-6">
                  <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{tDiagrams("waterfallDiagram.title")}</h3>
                  <InvoiceRunningTotalWaterfall stages={waterfallStages} formatValue={money} caption={tDiagrams("waterfallDiagram.caption")} />
                </div>
              )}

              {hasCalculated && showBeforeAfterDiscount && result && (
                <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-500/30 dark:bg-zinc-900 lg:p-6">
                  <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{tDiagrams("discountCompareDiagram.title")}</h3>
                  <InvoiceBeforeAfterDiscountBar
                    beforeLabel={tDiagrams("discountCompareDiagram.beforeLabel")}
                    afterLabel={tDiagrams("discountCompareDiagram.afterLabel")}
                    beforeValue={beforeDiscountTotal}
                    afterValue={result.total}
                    beforeFormatted={money(beforeDiscountTotal)}
                    afterFormatted={money(result.total)}
                    caption={tDiagrams("discountCompareDiagram.caption")}
                  />
                </div>
              )}

              <InvoiceChecklistReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
