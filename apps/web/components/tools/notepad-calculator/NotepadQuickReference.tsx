"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function NotepadQuickReference() {
  const t = useTranslations("tools.notepad-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{t("variableHint")}</p>
      <div dir="ltr" className="mt-4 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <p>+ − * / ^</p>
        <p>sin(x), cos(x), tan(x), sqrt(x), abs(x)</p>
        <p>ln(x), log(x), exp(x)</p>
        <p>pi, e</p>
      </div>
    </SectionCard>
  );
}
