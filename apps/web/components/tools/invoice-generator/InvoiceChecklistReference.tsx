"use client";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function InvoiceChecklistReference() {
  const t = useTranslations("tools.invoice-generator.aboveFold.checklist");
  const items = t.raw("items") as string[];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="text-zinc-600 dark:text-zinc-300">{item}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
