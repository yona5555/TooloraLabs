"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const PERCENTAGES = [10, 15, 20, 25, 50, 75];
const BASES = [50, 100, 200, 500];

export default function PercentageQuickReference() {
  const t = useTranslations("tools.percentage-calculator.aboveFold");

  return (
    <SectionCard title={t("quickReference.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("quickReference.intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="px-3 py-2 text-start font-medium">%</th>
              {BASES.map((base) => (
                <th key={base} className="px-3 py-2 text-end font-medium">
                  {base}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERCENTAGES.map((pct) => (
              <tr key={pct} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-zinc-100">{pct}%</td>
                {BASES.map((base) => (
                  <td key={base} className="px-3 py-2 text-end font-mono text-zinc-700 dark:text-zinc-300">
                    {(pct / 100) * base}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
