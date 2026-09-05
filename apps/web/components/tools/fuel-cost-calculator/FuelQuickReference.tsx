"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function FuelQuickReference() {
  const t = useTranslations("tools.fuel-cost-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Consumption mode: fuel used = (distance ÷ 100) × rate</p>
        <p>Efficiency mode: fuel used = distance ÷ rate</p>
        <p>Total cost = fuel used × price per unit</p>
      </div>
    </SectionCard>
  );
}
