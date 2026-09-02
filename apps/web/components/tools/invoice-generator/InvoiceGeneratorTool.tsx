"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { InvoiceGenerator } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import { usePrintExport } from "@/hooks/usePrintExport";
import InvoiceInputPanel, { type DraftLine } from "./InvoiceInputPanel";
import InvoicePreview from "./InvoicePreview";
import InvoiceChecklistReference from "./InvoiceChecklistReference";

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

export default function InvoiceGeneratorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.invoice-generator.errors");
  const tNav = useTranslations("tools.invoice-generator.nav");

  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-0001");
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(inDaysISO(14));
  const [currency, setCurrency] = useState("USD");
  const [lines, setLines] = useState<DraftLine[]>([
    { description: "", quantity: "1", unitPrice: "" },
  ]);
  const [taxRate, setTaxRate] = useState("0");
  const [discountPercent, setDiscountPercent] = useState("0");
  const { printRef, handlePrint } = usePrintExport<HTMLDivElement>();

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }
  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }
  function removeLine(index: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
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
              onCurrencyChange={setCurrency}
              lines={lines}
              onUpdateLine={updateLine}
              onAddLine={addLine}
              onRemoveLine={removeLine}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
              discountPercent={discountPercent}
              onDiscountPercentChange={setDiscountPercent}
            />
          }
          result={
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
          }
          sidebar={<RelatedToolsSidebar currentSlug="invoice-generator" category="business-finance" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <InvoiceChecklistReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
