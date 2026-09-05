"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function PaceQuickReference() {
  const t = useTranslations("tools.pace-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>5:00 /km × 5 km = 25:00</p>
        <p>10:00 /km ≈ 6 mph (9.7 km/h)</p>
        <p>4:00 /km ≈ 15 km/h (9.3 mph)</p>
      </div>
    </SectionCard>
  );
}
