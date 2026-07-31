"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { parseLocalizedNumber, formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  InventoryValuationCalculator,
  type InventoryValuationOutput,
} from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import PrintButton from "@/components/tool-ui/PrintButton";
import { usePrintExport } from "@/hooks/usePrintExport";

const tool = new InventoryValuationCalculator();

type DraftItem = { name: string; quantity: string; unitCost: string; reorderThreshold: string };

function emptyItem(): DraftItem {
  return { name: "", quantity: "0", unitCost: "", reorderThreshold: "" };
}

export default function InventoryValuationTool() {
  const t = useTranslations("tools.inventory-valuation-calculator");
  const [items, setItems] = useState<DraftItem[]>([emptyItem()]);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InventoryValuationOutput | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const { printRef, handlePrint } = usePrintExport<HTMLDivElement>();

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function formatCurrency(value: number) {
    return formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }

  function calculate() {
    setError("");
    setResult(null);

    const parsedItems = items.map((item) => ({
      name: item.name,
      quantity: parseLocalizedNumber(item.quantity),
      unitCost: parseLocalizedNumber(item.unitCost),
      reorderThreshold: item.reorderThreshold.trim()
        ? parseLocalizedNumber(item.reorderThreshold)
        : undefined,
    }));

    const output = tool.execute({ items: parsedItems }, { locale: "en-US" });
    if (!output.success) {
      const errorKey = output.metadata.error === "EMPTY_ITEMS" ? "emptyItems" : "invalidItem";
      setError(t(`errors.${errorKey}`));
      return;
    }

    setResult(output.data);
    setDigitStyle(
      resolveDigitStyle(...items.flatMap((i) => [i.quantity, i.unitCost, i.reorderThreshold]))
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
              <ToolInput
                label={index === 0 ? t("form.itemName") : undefined}
                type="text"
                placeholder={t("form.itemNamePlaceholder")}
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
              />
              <ToolInput
                label={index === 0 ? t("form.quantity") : undefined}
                type="text"
                inputMode="decimal"
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: e.target.value })}
              />
              <ToolInput
                label={index === 0 ? t("form.unitCost") : undefined}
                type="text"
                inputMode="decimal"
                value={item.unitCost}
                onChange={(e) => updateItem(index, { unitCost: e.target.value })}
              />
              <ToolInput
                label={index === 0 ? t("form.reorderThreshold") : undefined}
                type="text"
                inputMode="decimal"
                placeholder={t("form.optional")}
                value={item.reorderThreshold}
                onChange={(e) => updateItem(index, { reorderThreshold: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                aria-label={t("form.removeItem")}
                className="flex h-12 w-12 items-center justify-center self-end rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Plus size={16} />
            {t("form.addItem")}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <ToolButton type="button" onClick={calculate}>
          {t("form.calculate")}
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

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t("result.totalUnits")}
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatLocalizedNumber(result.totalUnits, digitStyle)}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t("result.totalValue")}
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(result.totalValue)}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t("result.lowStockCount")}
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {result.lowStockCount}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  <th className="py-2 text-start font-semibold">{t("result.item")}</th>
                  <th className="py-2 text-end font-semibold">{t("result.quantity")}</th>
                  <th className="py-2 text-end font-semibold">{t("result.unitCost")}</th>
                  <th className="py-2 text-end font-semibold">{t("result.value")}</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item, index) => (
                  <tr key={index} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="flex items-center gap-2 py-2 text-zinc-900 dark:text-zinc-100">
                      {item.belowThreshold && (
                        <AlertTriangle size={14} className="text-amber-500" />
                      )}
                      {item.name}
                    </td>
                    <td className="py-2 text-end text-zinc-700 dark:text-zinc-300">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-end text-zinc-700 dark:text-zinc-300">
                      {formatCurrency(item.unitCost)}
                    </td>
                    <td className="py-2 text-end font-medium text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
