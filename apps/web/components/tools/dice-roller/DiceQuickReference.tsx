"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function DiceQuickReference() {
  const t = useTranslations("tools.dice-roller.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Each die: a random whole number from 1 to (faces)</p>
        <p>Total = sum of all dice rolled</p>
      </div>
    </SectionCard>
  );
}
