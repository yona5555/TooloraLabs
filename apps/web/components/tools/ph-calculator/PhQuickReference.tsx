"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { COMMON_SUBSTANCES } from "./types";

export default function PhQuickReference() {
  const t = useTranslations("tools.ph-calculator.aboveFold.quickReference");
  const tSubstances = useTranslations("tools.ph-calculator.substances");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[240px] border-collapse text-sm">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="px-3 py-2 text-start font-medium">{t("columnSubstance")}</th>
              <th className="px-3 py-2 text-end font-medium">{t("columnPh")}</th>
            </tr>
          </thead>
          <tbody>
            {COMMON_SUBSTANCES.map((substance) => (
              <tr key={substance.key} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-zinc-100">{tSubstances(substance.key)}</td>
                <td className="px-3 py-2 text-end font-mono text-zinc-700 dark:text-zinc-300">{substance.pH}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
