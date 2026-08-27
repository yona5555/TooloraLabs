"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { NumberNameKey } from "./types";

const POWERS: Array<{ exponent: number; nameKey: NumberNameKey }> = [
  { exponent: 15, nameKey: "quadrillion" },
  { exponent: 12, nameKey: "trillion" },
  { exponent: 9, nameKey: "billion" },
  { exponent: 6, nameKey: "million" },
  { exponent: 3, nameKey: "thousand" },
  { exponent: -3, nameKey: "thousandth" },
  { exponent: -6, nameKey: "millionth" },
  { exponent: -9, nameKey: "billionth" },
  { exponent: -12, nameKey: "trillionth" },
];

export default function ScientificNotationQuickReference() {
  const t = useTranslations("tools.scientific-notation-converter.aboveFold");
  const tNames = useTranslations("tools.scientific-notation-converter.result.numberNames");

  return (
    <SectionCard title={t("quickReference.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("quickReference.intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-sm">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="px-3 py-2 text-start font-medium">{t("quickReference.columnPower")}</th>
              <th className="px-3 py-2 text-end font-medium">{t("quickReference.columnName")}</th>
            </tr>
          </thead>
          <tbody>
            {POWERS.map(({ exponent, nameKey }) => (
              <tr key={exponent} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-3 py-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">10^{exponent}</td>
                <td className="px-3 py-2 text-end text-zinc-700 dark:text-zinc-300">{tNames(nameKey)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
