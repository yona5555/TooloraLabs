"use client";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { BatchInvoiceCalculator as BatchInvoiceTool, summarizeInvoices } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import InvoiceDraftPanel from "./InvoiceDraftPanel";
import DraftPreview from "./DraftPreview";
import InvoiceTable from "./InvoiceTable";
import InvoiceSummary from "./InvoiceSummary";
import PrintableSummary from "./PrintableSummary";
import BatchInvoiceQuickReference from "./BatchInvoiceQuickReference";
import { readStoredInvoices, writeStoredInvoices, subscribeToInvoiceStorage, getServerInvoices } from "./storage";
import type { DraftLineItem, SavedInvoice } from "./types";

const tool = new BatchInvoiceTool();

const EMPTY_LINE_ITEM: DraftLineItem = { itemName: "", quantity: "1", unitPrice: "" };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function toNumericLineItems(lineItems: DraftLineItem[]) {
  return lineItems.map((item) => ({
    itemName: item.itemName,
    quantity: parseLocalizedNumber(item.quantity) || 0,
    unitPrice: parseLocalizedNumber(item.unitPrice) || 0,
  }));
}

export default function BatchInvoiceCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.batch-invoice-calculator.nav");

  const invoices = useSyncExternalStore(subscribeToInvoiceStorage, readStoredInvoices, getServerInvoices);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState(todayISO);
  const [vendor, setVendor] = useState("");
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([{ ...EMPTY_LINE_ITEM }]);
  const [taxPercent, setTaxPercent] = useState("0");
  const [editingId, setEditingId] = useState<string | null>(null);

  const digitStyle: DigitStyle = resolveDigitStyle(taxPercent, ...lineItems.map((l) => l.quantity + l.unitPrice));

  const draftResult = useMemo(() => {
    const output = tool.execute(
      { lineItems: toNumericLineItems(lineItems), taxPercent: parseLocalizedNumber(taxPercent) || 0 },
      { locale: "en-US" },
    );
    return output.data;
  }, [lineItems, taxPercent]);

  const invoiceResults = useMemo(
    () =>
      invoices.map((invoice) =>
        tool.execute({ lineItems: invoice.lineItems, taxPercent: invoice.taxPercent }, { locale: "en-US" }).data,
      ),
    [invoices],
  );

  const totals = invoiceResults.map((r) => r.total);
  const summary = useMemo(() => summarizeInvoices(invoiceResults), [invoiceResults]);

  function resetDraft() {
    setInvoiceNumber("");
    setDate(todayISO());
    setVendor("");
    setLineItems([{ ...EMPTY_LINE_ITEM }]);
    setTaxPercent("0");
    setEditingId(null);
  }

  function handleUpdateLineItem(index: number, patch: Partial<DraftLineItem>) {
    setLineItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function handleAddLineItem() {
    setLineItems((prev) => [...prev, { ...EMPTY_LINE_ITEM }]);
  }

  function handleRemoveLineItem(index: number) {
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function handleSave() {
    if (draftResult.error) return;

    const savedInvoice: SavedInvoice = {
      id: editingId ?? `${Date.now()}-${Math.random()}`,
      invoiceNumber,
      date,
      vendor,
      lineItems: toNumericLineItems(lineItems),
      taxPercent: parseLocalizedNumber(taxPercent) || 0,
    };

    const next = editingId
      ? invoices.map((inv) => (inv.id === editingId ? savedInvoice : inv))
      : [...invoices, savedInvoice];

    writeStoredInvoices(next);
    resetDraft();
  }

  function handleEdit(id: string) {
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) return;
    setInvoiceNumber(invoice.invoiceNumber);
    setDate(invoice.date);
    setVendor(invoice.vendor);
    setLineItems(
      invoice.lineItems.map((item) => ({
        itemName: item.itemName,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      })),
    );
    setTaxPercent(String(invoice.taxPercent));
    setEditingId(id);
  }

  function handleDelete(id: string) {
    writeStoredInvoices(invoices.filter((inv) => inv.id !== id));
    if (editingId === id) resetDraft();
  }

  function handleClearAll() {
    writeStoredInvoices([]);
    resetDraft();
  }

  function handlePrint() {
    window.print();
  }

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
            <InvoiceDraftPanel
              invoiceNumber={invoiceNumber}
              onInvoiceNumberChange={setInvoiceNumber}
              date={date}
              onDateChange={setDate}
              vendor={vendor}
              onVendorChange={setVendor}
              lineItems={lineItems}
              onUpdateLineItem={handleUpdateLineItem}
              onAddLineItem={handleAddLineItem}
              onRemoveLineItem={handleRemoveLineItem}
              taxPercent={taxPercent}
              onTaxPercentChange={setTaxPercent}
              onSave={handleSave}
              isEditing={editingId !== null}
            />
          }
          result={<DraftPreview result={draftResult} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="batch-invoice-calculator" category="business-finance" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <BatchInvoiceQuickReference />
            </div>
          }
        />

        <div className="mx-auto mt-8 grid max-w-6xl gap-6 px-4 lg:grid-cols-[1fr_320px] lg:px-0 print:hidden">
          <InvoiceTable invoices={invoices} totals={totals} digitStyle={digitStyle} onEdit={handleEdit} onDelete={handleDelete} />
          <InvoiceSummary summary={summary} digitStyle={digitStyle} onPrint={handlePrint} onClearAll={handleClearAll} />
        </div>

        <PrintableSummary invoices={invoices} totals={totals} summary={summary} digitStyle={digitStyle} />
      </div>

      {education}
    </>
  );
}
