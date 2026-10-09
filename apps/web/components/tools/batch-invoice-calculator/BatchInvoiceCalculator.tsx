"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { batchOverview } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import { ECB_CURRENCIES } from "@/lib/forex/ecb";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import SidebarFillList from "@/components/tools/markets/SidebarFillList";
import InvoiceBatchEditor from "./InvoiceBatchEditor";
import InvoiceFlowResult from "./InvoiceFlowResult";
import InvoiceWorkedExamples from "./InvoiceWorkedExamples";
import PrintableSummary from "./PrintableSummary";
import {
  ClientConcentration,
  CompositionDonut,
  CurrencyEquivalence,
  InvoiceTimeline,
  LineItemsRanked,
  LiveFormula,
  NetTaxBalance,
  NetTaxStacked,
  RevenueByClient,
  TaxSensitivityTrio,
  TotalsTrend,
  VatReferenceTable,
  type FxSnapshot,
} from "./InvoiceIndicators";
import { downloadCsv, downloadXlsx, type ExportLabels } from "./exportBatch";
import { invoiceFormatters } from "./format";
import { readBatch, writeBatch } from "./storage";
import { SAMPLE_SHAPE, USD_PEGS, newId, toBatch, type DraftInvoice, type DraftItem } from "./types";

const RELATED_TOOLS = ["invoice-generator", "sales-tax-calculator", "break-even-calculator", "forex-converter"];

const todayISO = () => new Date().toISOString().slice(0, 10);

type Props = { education: ReactNode; fx: FxSnapshot };

export default function BatchInvoiceCalculator({ education, fx }: Props) {
  const t = useTranslations("tools.batch-invoice-calculator");
  const tNav = useTranslations("tools.batch-invoice-calculator.nav");
  const tS = useTranslations("tools.batch-invoice-calculator.sample");
  const tE = useTranslations("tools.batch-invoice-calculator.export");

  const buildSample = useCallback(
    (): DraftInvoice[] =>
      SAMPLE_SHAPE.map((s) => ({
        id: s.key,
        number: s.number,
        date: s.date,
        client: tS(`${s.key}.client`),
        taxPercent: s.taxPercent,
        items: s.items.map(([key, quantity, unitPrice]) => ({ id: `${s.key}-${key}`, name: tS(`items.${key}`), quantity, unitPrice })),
      })),
    [tS]
  );

  // The server and first client render show the sample, so every indicator is alive before hydration.
  const [invoices, setInvoices] = useState<DraftInvoice[]>(buildSample);
  const [currency, setCurrency] = useState("USD");
  const [selectedId, setSelectedId] = useState<string | null>(SAMPLE_SHAPE[0].key);
  const loaded = useRef(false);

  useEffect(() => {
    const saved = readBatch();
    if (saved) {
      /* eslint-disable react-hooks/set-state-in-effect -- one-time restore of the visitor's saved batch */
      setInvoices(saved.invoices);
      setCurrency(saved.currency);
      setSelectedId(saved.invoices[0]?.id ?? null);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (loaded.current) writeBatch({ invoices, currency });
  }, [invoices, currency]);

  const batch = useMemo(() => toBatch(invoices), [invoices]);
  const overview = useMemo(() => batchOverview(batch), [batch]);
  const digitStyle = resolveDigitStyle(...invoices.flatMap((i) => [i.taxPercent, ...i.items.map((x) => x.quantity + x.unitPrice)]));
  const f = useMemo(() => invoiceFormatters(digitStyle, currency), [digitStyle, currency]);
  const selected = batch.find((b) => b.id === selectedId) ?? null;

  // ECB reference currencies, plus the dollar-pegged Gulf currencies; offered only when a rate exists.
  const fxRates = useMemo<FxSnapshot>(() => (fx ? { date: fx.date, perUsd: { ...fx.perUsd, USD: 1, ...USD_PEGS } } : { date: "—", perUsd: { USD: 1, ...USD_PEGS } }), [fx]);
  const currencies = useMemo(() => [...new Set<string>([...ECB_CURRENCIES, ...Object.keys(USD_PEGS)])].filter((c) => fxRates!.perUsd[c]).sort(), [fxRates]);

  const patchInvoice = (id: string, fn: (inv: DraftInvoice) => DraftInvoice) => setInvoices((prev) => prev.map((inv) => (inv.id === id ? fn(inv) : inv)));
  const blankItem = (): DraftItem => ({ id: newId(), name: "", quantity: "1", unitPrice: "" });

  function addInvoice() {
    const n = invoices.length + 1;
    const inv: DraftInvoice = { id: newId(), number: `INV-${1000 + n}`, date: todayISO(), client: "", taxPercent: invoices.at(-1)?.taxPercent ?? "0", items: [blankItem()] };
    setInvoices((prev) => [...prev, inv]);
    setSelectedId(inv.id);
  }

  function duplicateInvoice(id: string) {
    const src = invoices.find((i) => i.id === id);
    if (!src) return;
    const copy: DraftInvoice = { ...src, id: newId(), number: `${src.number}-2`, items: src.items.map((it) => ({ ...it, id: newId() })) };
    setInvoices((prev) => {
      const at = prev.findIndex((i) => i.id === id);
      return [...prev.slice(0, at + 1), copy, ...prev.slice(at + 1)];
    });
    setSelectedId(copy.id);
  }

  function removeInvoice(id: string) {
    const rest = invoices.filter((i) => i.id !== id);
    setInvoices(rest);
    if (selectedId === id) setSelectedId(rest[0]?.id ?? null);
  }

  function applyRate(rate: number) {
    if (!selectedId) return;
    patchInvoice(selectedId, (inv) => ({ ...inv, taxPercent: String(rate) }));
    document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
  }

  const exportLabels: ExportLabels = {
    invoice: tE("invoice"),
    date: tE("date"),
    client: tE("client"),
    item: tE("item"),
    quantity: tE("quantity"),
    unitPrice: tE("unitPrice"),
    lineTotal: tE("lineTotal"),
    taxRate: tE("taxRate"),
    net: tE("net"),
    tax: tE("tax"),
    total: tE("total"),
    currency: tE("currency"),
    grandTotal: tE("grandTotal"),
    itemsSheet: tE("itemsSheet"),
    summarySheet: tE("summarySheet"),
  };

  const ind = { invoices: batch, overview, f };

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "line-items", label: tNav("composition") },
    { id: "trend", label: tNav("clients") },
    { id: "balance", label: tNav("tax") },
    { id: "worked-examples", label: tNav("examples") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32 print:hidden">
        <ToolAboveFold
          stretchInput
          input={
            <InvoiceBatchEditor
              invoices={invoices}
              selectedId={selectedId}
              onSelect={setSelectedId}
              currency={currency}
              currencies={currencies}
              onCurrencyChange={setCurrency}
              onAddInvoice={addInvoice}
              onDuplicateInvoice={duplicateInvoice}
              onRemoveInvoice={removeInvoice}
              onUpdateInvoice={(id, patch) => patchInvoice(id, (inv) => ({ ...inv, ...patch }))}
              onAddItem={(id) => patchInvoice(id, (inv) => ({ ...inv, items: [...inv.items, blankItem()] }))}
              onUpdateItem={(id, itemId, patch) => patchInvoice(id, (inv) => ({ ...inv, items: inv.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }))}
              onDuplicateItem={(id, itemId) =>
                patchInvoice(id, (inv) => {
                  const at = inv.items.findIndex((it) => it.id === itemId);
                  return { ...inv, items: [...inv.items.slice(0, at + 1), { ...inv.items[at], id: newId() }, ...inv.items.slice(at + 1)] };
                })
              }
              onRemoveItem={(id, itemId) => patchInvoice(id, (inv) => ({ ...inv, items: inv.items.length > 1 ? inv.items.filter((it) => it.id !== itemId) : inv.items }))}
              onLoadSample={() => {
                const s = buildSample();
                setInvoices(s);
                setSelectedId(s[0].id);
              }}
              onClearAll={() => {
                setInvoices([]);
                setSelectedId(null);
              }}
              onApplyRate={(rate) => selectedId && patchInvoice(selectedId, (inv) => ({ ...inv, taxPercent: String(rate) }))}
              f={f}
            />
          }
          result={
            <div className="flex flex-col gap-6">
              <InvoiceFlowResult
                invoice={selected}
                overview={overview}
                f={f}
                onPrint={() => window.print()}
                onCsv={() => downloadCsv(batch, currency, exportLabels)}
                onExcel={() => void downloadXlsx(batch, currency, exportLabels)}
              />
              <CurrencyEquivalence {...ind} fx={fxRates} />
            </div>
          }
          sidebar={
            <RelatedToolsSidebar currentSlug="batch-invoice-calculator" category="business-finance" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          sidebarFill={
            <SidebarFillList
              title={t("sidebar.title", { count: overview.invoiceCount })}
              note={t("sidebar.note")}
              rows={[
                ...overview.perInvoice.map((r) => ({ id: r.id, label: r.number || "—", sub: [r.date, r.client].filter(Boolean).join(" · "), value: f.money(r.total), changeText: f.pct(overview.grand ? (r.total / overview.grand) * 100 : 0) })),
                { id: "s-net", label: tE("net"), value: f.money(overview.net) },
                { id: "s-tax", label: tE("tax"), value: f.money(overview.tax), changeText: f.pct(overview.effectiveTaxRate, 2) },
                { id: "s-avg", label: t("sidebar.average"), value: f.money(overview.averageInvoice) },
                { id: "s-items", label: t("sidebar.items"), value: f.num(overview.itemCount, 0) },
                { id: "s-grand", label: tE("grandTotal"), value: f.money(overview.grand) },
              ]}
            />
          }
        />
      </div>

      {/* Below the fold every card spans the full width; leaderboards sit between groups only. */}
      <div className="mt-6 flex flex-col gap-6 print:hidden">
        <SectionNav items={navItems} />
        <ViewDocsLink slug="batch-invoice-calculator" />

        {/* Group 1 — what the batch is made of */}
        <LineItemsRanked {...ind} />
        <CompositionDonut {...ind} />
        <NetTaxStacked {...ind} />
        <LiveFormula {...ind} />
        <AdSpace variant="leaderboard" />

        {/* Group 2 — when and who */}
        <TotalsTrend {...ind} />
        <InvoiceTimeline {...ind} />
        <RevenueByClient {...ind} />
        <ClientConcentration {...ind} />
        <AdSpace variant="leaderboard" />

        {/* Group 3 — the tax side */}
        <NetTaxBalance {...ind} />
        <TaxSensitivityTrio {...ind} />
        <VatReferenceTable {...ind} onUseRate={applyRate} />
        <AdSpace variant="leaderboard" />

        <InvoiceWorkedExamples />
      </div>

      <PrintableSummary invoices={batch} overview={overview} f={f} />

      <div className="print:hidden">{education}</div>
    </>
  );
}
