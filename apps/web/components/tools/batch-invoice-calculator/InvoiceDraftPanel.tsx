"use client";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";
import type { DraftLineItem } from "./types";

type Props = {
  invoiceNumber: string;
  onInvoiceNumberChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  vendor: string;
  onVendorChange: (value: string) => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  lineItems: DraftLineItem[];
  onUpdateLineItem: (index: number, patch: Partial<DraftLineItem>) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (index: number) => void;
  taxPercent: string;
  onTaxPercentChange: (value: string) => void;
  onSave: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  isEditing: boolean;
};

export default function InvoiceDraftPanel({
  invoiceNumber,
  onInvoiceNumberChange,
  date,
  onDateChange,
  vendor,
  onVendorChange,
  currency,
  onCurrencyChange,
  lineItems,
  onUpdateLineItem,
  onAddLineItem,
  onRemoveLineItem,
  taxPercent,
  onTaxPercentChange,
  onSave,
  onLoadSample,
  onClear,
  isEditing,
}: Props) {
  const t = useTranslations("tools.batch-invoice-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onLoadSample}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
        >
          {t("loadSampleInvoice")}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={13} />
          {t("clearDraft")}
        </button>
      </div>
      {/*
        Deliberately stacked, not a 2-col grid: this panel always renders in
        the fixed ~320px-wide above-the-fold column (ToolAboveFold's
        `[320px_minmax(360px,1fr)_320px]` template), so a viewport-relative
        `sm:grid-cols-2` still activates at normal desktop widths even
        though the actual available card width never grows — squeezing the
        native date input below Chromium's minimum usable width and
        truncating its day/month/year segments (confirmed in both English
        and Arabic, so this isn't an RTL-specific issue despite how it was
        first noticed).
      */}
      <div className="space-y-4">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />
        <ToolInput
          label={t("invoiceNumberLabel")}
          type="text"
          placeholder={t("invoiceNumberPlaceholder")}
          value={invoiceNumber}
          onChange={(e) => onInvoiceNumberChange(e.target.value)}
        />
        <ToolInput label={t("dateLabel")} type="date" dir="ltr" value={date} onChange={(e) => onDateChange(e.target.value)} />
      </div>

      <div className="mt-4">
        <ToolInput
          label={t("vendorLabel")}
          type="text"
          placeholder={t("vendorPlaceholder")}
          value={vendor}
          onChange={(e) => onVendorChange(e.target.value)}
        />
      </div>

      <div className="mt-5 space-y-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("itemsLabel")}</span>
        {lineItems.map((item, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <ToolInput
              type="text"
              placeholder={t("itemNamePlaceholder")}
              value={item.itemName}
              onChange={(e) => onUpdateLineItem(index, { itemName: e.target.value })}
            />
            <ToolInput
              type="text"
              inputMode="decimal"
              placeholder={t("itemQuantityPlaceholder")}
              value={item.quantity}
              onChange={(e) => onUpdateLineItem(index, { quantity: e.target.value })}
            />
            <ToolInput
              type="text"
              inputMode="decimal"
              placeholder={t("itemUnitPricePlaceholder")}
              value={item.unitPrice}
              onChange={(e) => onUpdateLineItem(index, { unitPrice: e.target.value })}
            />
            <button
              type="button"
              onClick={() => onRemoveLineItem(index)}
              aria-label={t("removeItem")}
              disabled={lineItems.length <= 1}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddLineItem}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          <Plus size={16} />
          {t("addItem")}
        </button>
      </div>

      <div className="mt-4">
        <ToolInput
          label={t("taxPercentLabel")}
          type="text"
          inputMode="decimal"
          value={taxPercent}
          onChange={(e) => onTaxPercentChange(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={onSave}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <Save size={18} />
        {isEditing ? t("updateInvoice") : t("saveAndAddNew")}
      </button>
    </SectionCard>
  );
}
