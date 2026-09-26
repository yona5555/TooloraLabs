"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { BatchInvoiceCalculator as BatchInvoiceTool, summarizeInvoices } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { convertAmountString, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import InvoiceDraftPanel from "./InvoiceDraftPanel";
import DraftPreview from "./DraftPreview";
import InvoiceTable from "./InvoiceTable";
import InvoiceSummary from "./InvoiceSummary";
import PrintableSummary from "./PrintableSummary";
import BatchInvoiceQuickReference from "./BatchInvoiceQuickReference";
import { readStoredInvoices, writeStoredInvoices, subscribeToInvoiceStorage, getServerInvoices } from "./storage";
import { SAMPLE_INVOICE, type DraftLineItem, type SavedInvoice } from "./types";

const tool = new BatchInvoiceTool();
const RELATED_TOOLS = ["invoice-generator", "sales-tax-calculator", "break-even-calculator"];

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
  const t = useTranslations("tools.batch-invoice-calculator");

  const invoices = useSyncExternalStore(subscribeToInvoiceStorage, readStoredInvoices, getServerInvoices);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState(todayISO);
  const [vendor, setVendor] = useState("");
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([{ ...EMPTY_LINE_ITEM }]);
  const [taxPercent, setTaxPercent] = useState("0");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  const [navBarVisible, setNavBarVisible] = useState(false);
  const headerSentinelRef = useRef<HTMLDivElement>(null);

  // Same dual-observer hysteresis technique as Break-Even/Discount/Sales Tax Calculator: two
  // margins (a deeper "show" line, a shallower "hide" line) create a dead zone so momentum-
  // scroll jitter near either line can't flip visibility back and forth every frame, and the bar
  // never renders pinned over the H1 on first load.
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

  function handleCurrencyChange(next: CurrencyCode) {
    if (next === currency) return;
    setLineItems((prev) =>
      prev.map((item) => ({ ...item, unitPrice: convertAmountString(item.unitPrice, currency, next, (raw) => parseLocalizedNumber(raw) || 0) }))
    );
    setCurrency(next);
  }

  function handleAddLineItem() {
    setLineItems((prev) => [...prev, { ...EMPTY_LINE_ITEM }]);
  }

  function handleRemoveLineItem(index: number) {
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function handleLoadSample() {
    setInvoiceNumber(SAMPLE_INVOICE.invoiceNumber);
    setDate(todayISO());
    setVendor(SAMPLE_INVOICE.vendor);
    setLineItems(SAMPLE_INVOICE.lineItems.map((item) => ({ ...item })));
    setTaxPercent(SAMPLE_INVOICE.taxPercent);
    setEditingId(null);
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
      <div ref={headerSentinelRef} aria-hidden="true" />
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
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              lineItems={lineItems}
              onUpdateLineItem={handleUpdateLineItem}
              onAddLineItem={handleAddLineItem}
              onRemoveLineItem={handleRemoveLineItem}
              taxPercent={taxPercent}
              onTaxPercentChange={setTaxPercent}
              onSave={handleSave}
              onLoadSample={handleLoadSample}
              onClear={resetDraft}
              isEditing={editingId !== null}
            />
          }
          result={
            <div className="flex flex-col gap-4">
              <DraftPreview result={draftResult} digitStyle={digitStyle} currency={currency} />
              <InvoiceSummary
                summary={summary}
                digitStyle={digitStyle}
                currency={currency}
                onPrint={handlePrint}
                onClearAll={handleClearAll}
                invoices={invoices}
                invoiceResults={invoiceResults}
              />
              <BatchInvoiceQuickReference />
            </div>
          }
          sidebar={
            <RelatedToolsSidebar
              currentSlug="batch-invoice-calculator"
              category="business-finance"
              relatedList={RELATED_TOOLS}
              relatedListTitle={t("relatedTools.title")}
            />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} visible={navBarVisible} />
              <ViewDocsLink slug="batch-invoice-calculator" />
            </div>
          }
        />

        <div className="mx-auto mt-8 max-w-6xl px-4 lg:px-0 print:hidden">
          <InvoiceTable invoices={invoices} totals={totals} digitStyle={digitStyle} currency={currency} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <PrintableSummary invoices={invoices} totals={totals} summary={summary} digitStyle={digitStyle} currency={currency} />
      </div>

      {education}
    </>
  );
}
