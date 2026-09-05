"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function OvulationQuickReference() {
  const t = useTranslations("tools.ovulation-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Ovulation = Next Period − Luteal Phase Length</p>
        <p>Fertile Window = Ovulation − 5 days through Ovulation + 1 day</p>
      </div>
    </SectionCard>
  );
}
