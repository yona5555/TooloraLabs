"use client";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";

type GuidanceRow = { text: string; recommended: boolean };

export default function PasswordGuidanceReference() {
  const t = useTranslations("tools.password-generator.aboveFold.guidance");
  const rows = t.raw("rows") as GuidanceRow[];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div key={row.text} className="flex items-start gap-2.5 text-sm">
            {row.recommended ? (
              <Check size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <X size={16} className="mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
            )}
            <span className="text-zinc-600 dark:text-zinc-300">{row.text}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
