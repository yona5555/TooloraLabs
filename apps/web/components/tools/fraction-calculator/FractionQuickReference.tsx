"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const COMMON_FRACTIONS: Array<[number, number]> = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
  [1, 5],
  [1, 8],
  [3, 8],
  [5, 8],
  [7, 8],
];

export default function FractionQuickReference() {
  const t = useTranslations("tools.fraction-calculator.aboveFold");

  return (
    <SectionCard title={t("quickReference.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("quickReference.intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-sm">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="px-3 py-2 text-start font-medium">{t("quickReference.columnFraction")}</th>
              <th className="px-3 py-2 text-end font-medium">{t("quickReference.columnDecimal")}</th>
            </tr>
          </thead>
          <tbody>
            {COMMON_FRACTIONS.map(([numerator, denominator]) => (
              <tr key={`${numerator}/${denominator}`} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-zinc-100">
                  {numerator}/{denominator}
                </td>
                <td className="px-3 py-2 text-end font-mono text-zinc-700 dark:text-zinc-300">
                  {(numerator / denominator).toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
