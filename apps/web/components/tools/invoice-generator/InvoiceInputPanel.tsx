"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";

export type DraftLine = { description: string; quantity: string; unitPrice: string };

type InvoiceInputPanelProps = {
  fromName: string;
  onFromNameChange: (value: string) => void;
  toName: string;
  onToNameChange: (value: string) => void;
  invoiceNumber: string;
  onInvoiceNumberChange: (value: string) => void;
  issueDate: string;
  onIssueDateChange: (value: string) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  currency: CurrencyCode;
  onCurrencyChange: (value: CurrencyCode) => void;
  lines: DraftLine[];
  onUpdateLine: (index: number, patch: Partial<DraftLine>) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  taxRate: string;
  onTaxRateChange: (value: string) => void;
  discountPercent: string;
  onDiscountPercentChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function InvoiceInputPanel({
  fromName,
  onFromNameChange,
  toName,
  onToNameChange,
  invoiceNumber,
  onInvoiceNumberChange,
  issueDate,
  onIssueDateChange,
  dueDate,
  onDueDateChange,
  currency,
  onCurrencyChange,
  lines,
  onUpdateLine,
  onAddLine,
  onRemoveLine,
  taxRate,
  onTaxRateChange,
  discountPercent,
  onDiscountPercentChange,
  onCalculate,
  onClear,
}: InvoiceInputPanelProps) {
  const t = useTranslations("tools.invoice-generator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={onCalculate}>
        <div className="grid gap-4 sm:grid-cols-2">
          <ToolInput label={t("fromLabel")} type="text" placeholder={t("fromPlaceholder")} value={fromName} onChange={(e) => onFromNameChange(e.target.value)} />
          <ToolInput label={t("toLabel")} type="text" placeholder={t("toPlaceholder")} value={toName} onChange={(e) => onToNameChange(e.target.value)} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ToolInput label={t("invoiceNumberLabel")} type="text" value={invoiceNumber} onChange={(e) => onInvoiceNumberChange(e.target.value)} />
          <CurrencySelector value={currency} onChange={onCurrencyChange} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ToolInput label={t("issueDateLabel")} type="date" value={issueDate} onChange={(e) => onIssueDateChange(e.target.value)} />
          <ToolInput label={t("dueDateLabel")} type="date" value={dueDate} onChange={(e) => onDueDateChange(e.target.value)} />
        </div>

        <div className="mt-5 space-y-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("itemsLabel")}</span>
          {lines.map((line, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
              <ToolInput
                type="text"
                placeholder={t("itemDescriptionPlaceholder")}
                value={line.description}
                onChange={(e) => onUpdateLine(index, { description: e.target.value })}
              />
              <ToolInput
                type="text"
                inputMode="decimal"
                placeholder={t("itemQuantity")}
                value={line.quantity}
                onChange={(e) => onUpdateLine(index, { quantity: e.target.value })}
              />
              <ToolInput
                type="text"
                inputMode="decimal"
                placeholder={t("itemUnitPrice")}
                value={line.unitPrice}
                onChange={(e) => onUpdateLine(index, { unitPrice: e.target.value })}
              />
              <button
                type="button"
                onClick={() => onRemoveLine(index)}
                aria-label={t("removeItem")}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={onAddLine}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-400 dark:hover:bg-blue-500/10"
          >
            <Plus size={16} />
            {t("addItem")}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ToolInput label={t("taxRate")} type="text" inputMode="decimal" value={taxRate} onChange={(e) => onTaxRateChange(e.target.value)} />
          <ToolInput label={t("discountPercent")} type="text" inputMode="decimal" value={discountPercent} onChange={(e) => onDiscountPercentChange(e.target.value)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800">
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
