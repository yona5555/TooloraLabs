"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function GraphQuickReference() {
  const t = useTranslations("tools.graphing-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <p>x^2 - 3*x + 1</p>
        <p>sin(x) * 2</p>
        <p>sqrt(x)</p>
        <p>1 / x</p>
      </div>
    </SectionCard>
  );
}
