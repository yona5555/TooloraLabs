"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function TargetHeartRateQuickReference() {
  const t = useTranslations("tools.target-heart-rate-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Max HR = 220 − Age</p>
        <p>Simple zone = Max HR × intensity%</p>
        <p>Karvonen zone = ((Max HR − Resting HR) × intensity%) + Resting HR</p>
      </div>
    </SectionCard>
  );
}
