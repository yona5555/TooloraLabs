"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import { HierarchicalItemCard, ItemFieldsGrid, NestedItemSection, RemoveRowButton, AddRowButton } from "@/components/tool-ui/HierarchicalItemInputPanel";
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
          <HierarchicalItemCard
            key={itemIndex}
            identity={
              <ToolInput
                label={t("itemName")}
                placeholder={t("itemNamePlaceholder")}
                value={item.name}
                onChange={(e) => updateItem(itemIndex, { name: e.target.value })}
              />
            }
            onRemove={() => removeItem(itemIndex)}
            removeLabel={t("removeItem")}
            removeDisabled={items.length <= 1}
          >
            <ItemFieldsGrid>
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
            </ItemFieldsGrid>

            <NestedItemSection title={t("batchesTitle")}>
              {item.batches.map((batch, batchIndex) => (
                <div key={batchIndex} className="flex items-end gap-2">
                  <ItemFieldsGrid className="flex-1" minFieldWidth={90}>
                    <ToolInput
                      label={t("batchQuantity")}
                      type="text"
                      inputMode="decimal"
                      value={batch.quantity}
                      onChange={(e) => updateBatch(itemIndex, batchIndex, { quantity: e.target.value })}
                    />
                    <ToolInput
                      label={t("batchUnitCost")}
                      type="text"
                      inputMode="decimal"
                      value={batch.unitCost}
                      onChange={(e) => updateBatch(itemIndex, batchIndex, { unitCost: e.target.value })}
                    />
                  </ItemFieldsGrid>
                  <RemoveRowButton
                    onClick={() => removeBatch(itemIndex, batchIndex)}
                    label={t("removeBatch")}
                    disabled={item.batches.length <= 1}
                    size="sm"
                  />
                </div>
              ))}
              <AddRowButton onClick={() => addBatch(itemIndex)} label={t("addBatch")} />
            </NestedItemSection>
          </HierarchicalItemCard>
        ))}

        <AddRowButton onClick={addItem} label={t("addItem")} />

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
