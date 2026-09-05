"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function BatchInvoiceQuickReference() {
  const t = useTranslations("tools.batch-invoice-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Line total = quantity × unit price</p>
        <p>Invoice total = subtotal + (subtotal × tax%)</p>
        <p>Grand total = sum of all saved invoice totals</p>
      </div>
    </SectionCard>
  );
}
