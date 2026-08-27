"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { MATERIAL_DENSITIES, MATERIAL_KEYS } from "./types";

export default function DensityQuickReference() {
  const t = useTranslations("tools.density-calculator.aboveFold.quickReference");
  const tMaterials = useTranslations("tools.density-calculator.materials");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[240px] border-collapse text-sm">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="px-3 py-2 text-start font-medium">{t("columnMaterial")}</th>
              <th className="px-3 py-2 text-end font-medium">{t("columnDensity")}</th>
            </tr>
          </thead>
          <tbody>
            {MATERIAL_KEYS.map((key) => (
              <tr key={key} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-zinc-100">{tMaterials(key)}</td>
                <td className="px-3 py-2 text-end font-mono text-zinc-700 dark:text-zinc-300">
                  {MATERIAL_DENSITIES[key]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
