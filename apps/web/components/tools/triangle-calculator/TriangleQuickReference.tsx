"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function TriangleQuickReference() {
  const t = useTranslations("tools.triangle-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>A + B + C = 180°</p>
        <p>a² = b² + c² − 2bc·cos(A)</p>
        <p>a / sin(A) = b / sin(B) = c / sin(C)</p>
      </div>
    </SectionCard>
  );
}
