"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function CircleQuickReference() {
  const t = useTranslations("tools.circle-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>d = 2r</p>
        <p>C = 2πr = πd</p>
        <p>A = πr²</p>
      </div>
    </SectionCard>
  );
}
