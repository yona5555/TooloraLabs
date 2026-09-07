"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { COMMON_SUBSTANCES } from "./types";

type PhSubstanceCardProps = {
  pH: number;
};

export default function PhSubstanceCard({ pH }: PhSubstanceCardProps) {
  const t = useTranslations("tools.ph-calculator.substanceCard");
  const tSubstances = useTranslations("tools.ph-calculator.substances");

  const nearest = COMMON_SUBSTANCES.reduce((closest, substance) =>
    Math.abs(substance.pH - pH) < Math.abs(closest.pH - pH) ? substance : closest
  );

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
        {t("result", { substance: tSubstances(nearest.key), substancePH: nearest.pH })}
      </p>
    </SectionCard>
  );
}
