"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { BalancedTerm } from "./types";

type BalancerCoefficientSumCardProps = {
  terms: BalancedTerm[];
};

export default function BalancerCoefficientSumCard({ terms }: BalancerCoefficientSumCardProps) {
  const t = useTranslations("tools.chemical-equation-balancer.coefficientSumCard");
  const sum = terms.reduce((total, term) => total + term.coefficient, 0);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      {sum > 0 && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("result", { sum })}
        </p>
      )}
    </SectionCard>
  );
}
