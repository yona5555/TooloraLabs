"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";
import { emptyBatch, emptyItem, type DraftItem } from "./types";

type InventoryInputPanelProps = {
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  items: DraftItem[];
  onItemsChange: (items: DraftItem[]) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function InventoryInputPanel({ currency, onCurrencyChange, items, onItemsChange, onCalculate, onClear }: InventoryInputPanelProps) {
  const t = useTranslations("tools.inventory-valuation-calculator.form");

  function updateItem(index: number, patch: Partial<DraftItem>) {
    onItemsChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }
  function addItem() {
    onItemsChange([...items, emptyItem()]);
  }
  function removeItem(index: number) {
    onItemsChange(items.length > 1 ? items.filter((_, i) => i !== index) : items);
  }
  function updateBatch(itemIndex: number, batchIndex: number, patch: Partial<{ quantity: string; unitCost: string }>) {
    const batches = items[itemIndex].batches.map((b, i) => (i === batchIndex ? { ...b, ...patch } : b));
    updateItem(itemIndex, { batches });
  }
  function addBatch(itemIndex: number) {
    updateItem(itemIndex, { batches: [...items[itemIndex].batches, emptyBatch()] });
  }
  function removeBatch(itemIndex: number, batchIndex: number) {
    const item = items[itemIndex];
    if (item.batches.length <= 1) return;
    updateItem(itemIndex, { batches: item.batches.filter((_, i) => i !== batchIndex) });
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-6">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />

        {items.map((item, itemIndex) => (
          <div
            key={itemIndex}
            className="space-y-3 rounded-xl border border-zinc-100 p-4 dark:border-zinc-800/60"
          >
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
              <ToolInput
                label={t("itemName")}
                placeholder={t("itemNamePlaceholder")}
                value={item.name}
                onChange={(e) => updateItem(itemIndex, { name: e.target.value })}
              />
              <ToolInput
                label={t("unitsSold")}
                hint={t("unitsSoldHint")}
                type="text"
                inputMode="decimal"
                placeholder={t("optional")}
                value={item.unitsSold}
                onChange={(e) => updateItem(itemIndex, { unitsSold: e.target.value })}
              />
              <ToolInput
                label={t("reorderThreshold")}
                type="text"
                inputMode="decimal"
                placeholder={t("optional")}
                value={item.reorderThreshold}
                onChange={(e) => updateItem(itemIndex, { reorderThreshold: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeItem(itemIndex)}
                aria-label={t("removeItem")}
                className="flex h-12 w-12 items-center justify-center self-end rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t("batchesTitle")}
              </p>
              {item.batches.map((batch, batchIndex) => (
                <div key={batchIndex} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <ToolInput
                    label={batchIndex === 0 ? t("batchQuantity") : undefined}
                    type="text"
                    inputMode="decimal"
                    value={batch.quantity}
                    onChange={(e) => updateBatch(itemIndex, batchIndex, { quantity: e.target.value })}
                  />
                  <ToolInput
                    label={batchIndex === 0 ? t("batchUnitCost") : undefined}
                    type="text"
                    inputMode="decimal"
                    value={batch.unitCost}
                    onChange={(e) => updateBatch(itemIndex, batchIndex, { unitCost: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeBatch(itemIndex, batchIndex)}
                    aria-label={t("removeBatch")}
                    className="flex h-12 w-12 items-center justify-center self-end rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addBatch(itemIndex)}
                className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Plus size={14} />
                {t("addBatch")}
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Plus size={16} />
          {t("addItem")}
        </button>

        <div className="flex flex-wrap gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <ToolButton type="submit">{t("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
