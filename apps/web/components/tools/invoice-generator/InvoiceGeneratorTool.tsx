"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { parseLocalizedNumber, formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { InvoiceGenerator, type InvoiceGeneratorOutput } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import PrintButton from "@/components/tool-ui/PrintButton";
import { usePrintExport } from "@/hooks/usePrintExport";

const tool = new InvoiceGenerator();

type DraftLine = { description: string; quantity: string; unitPrice: string };

function emptyLine(): DraftLine {
  return { description: "", quantity: "1", unitPrice: "" };
}

export default function InvoiceGeneratorTool() {
  const t = useTranslations("tools.invoice-generator");
  const [lines, setLines] = useState<DraftLine[]>([emptyLine()]);
  const [taxRate, setTaxRate] = useState("0");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [error, setError] = useState("");
  const [result, setResult] = useState<InvoiceGeneratorOutput | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
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

  function formatCurrency(value: number) {
    return formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }

  function generate() {
    setError("");
    setResult(null);

    const parsedTaxRate = parseLocalizedNumber(taxRate);
    const parsedDiscount = parseLocalizedNumber(discountPercent);

    if (Number.isNaN(parsedTaxRate) || Number.isNaN(parsedDiscount)) {
      setError(t("errors.required"));
      return;
    }

    const items = lines.map((line) => ({
      description: line.description,
      quantity: parseLocalizedNumber(line.quantity),
      unitPrice: parseLocalizedNumber(line.unitPrice),
    }));

    const output = tool.execute(
      { items, taxRate: parsedTaxRate, discountPercent: parsedDiscount },
      { locale: "en-US" }
    );
    if (!output.success) {
      const errorKey =
        output.metadata.error === "EMPTY_ITEMS"
          ? "emptyItems"
          : output.metadata.error === "INVALID_ITEM"
            ? "invalidItem"
            : output.metadata.error === "INVALID_TAX_RATE"
              ? "invalidTaxRate"
              : "invalidDiscount";
      setError(t(`errors.${errorKey}`));
      return;
    }

    setResult(output.data);
    setDigitStyle(resolveDigitStyle(taxRate, discountPercent, ...lines.flatMap((l) => [l.quantity, l.unitPrice])));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        <div className="space-y-4">
          {lines.map((line, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
              <ToolInput
                label={index === 0 ? t("form.itemDescription") : undefined}
                type="text"
                placeholder={t("form.itemDescriptionPlaceholder")}
                value={line.description}
                onChange={(e) => updateLine(index, { description: e.target.value })}
              />
              <ToolInput
                label={index === 0 ? t("form.itemQuantity") : undefined}
                type="text"
                inputMode="decimal"
                value={line.quantity}
                onChange={(e) => updateLine(index, { quantity: e.target.value })}
              />
              <ToolInput
                label={index === 0 ? t("form.itemUnitPrice") : undefined}
                type="text"
                inputMode="decimal"
                value={line.unitPrice}
                onChange={(e) => updateLine(index, { unitPrice: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeLine(index)}
                aria-label={t("form.removeItem")}
                className="flex h-12 w-12 items-center justify-center self-end rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Plus size={16} />
            {t("form.addItem")}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ToolInput
            label={t("form.taxRate")}
            type="text"
            inputMode="decimal"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
          />
          <ToolInput
            label={t("form.discountPercent")}
            type="text"
            inputMode="decimal"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <ToolButton type="button" onClick={generate}>
          {t("form.generate")}
        </ToolButton>
      </div>

      {result && (
        <div
          ref={printRef}
          data-print-area
          className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none"
        >
          <div className="flex items-center justify-between print:hidden">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{t("result.title")}</h3>
            <PrintButton onPrint={handlePrint} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  <th className="py-2 text-start font-semibold">{t("result.item")}</th>
                  <th className="py-2 text-end font-semibold">{t("result.quantity")}</th>
                  <th className="py-2 text-end font-semibold">{t("result.unitPrice")}</th>
                  <th className="py-2 text-end font-semibold">{t("result.lineTotal")}</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line, index) => (
                  <tr key={index} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 text-zinc-900 dark:text-zinc-100">{line.description}</td>
                    <td className="py-2 text-end text-zinc-700 dark:text-zinc-300">{line.quantity}</td>
                    <td className="py-2 text-end text-zinc-700 dark:text-zinc-300">
                      {formatCurrency(line.unitPrice)}
                    </td>
                    <td className="py-2 text-end font-medium text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ms-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <span>{t("result.subtotal")}</span>
              <span>{formatCurrency(result.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <span>{t("result.discount")}</span>
              <span>-{formatCurrency(result.discountAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <span>{t("result.tax")}</span>
              <span>{formatCurrency(result.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-lg font-bold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
              <span>{t("result.grandTotal")}</span>
              <span>{formatCurrency(result.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
