"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const EXAMPLES = ["H2 + O2 -> H2O", "N2 + H2 -> NH3", "Fe + O2 -> Fe2O3", "CH4 + O2 -> CO2 + H2O"];

export default function BalancerQuickReference() {
  const t = useTranslations("tools.chemical-equation-balancer.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-col gap-2">
        {EXAMPLES.map((equation) => (
          <span key={equation} className="rounded-md border border-zinc-200 px-2.5 py-1.5 font-mono text-sm dark:border-zinc-700">
            {equation}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{t("syntaxHint")}</p>
    </SectionCard>
  );
}
