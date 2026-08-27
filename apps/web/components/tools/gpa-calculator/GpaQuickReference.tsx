"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { GRADE_POINTS, LETTER_GRADES } from "./types";

export default function GpaQuickReference() {
  const t = useTranslations("tools.gpa-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[240px] border-collapse text-sm">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="px-3 py-2 text-start font-medium">{t("columnGrade")}</th>
              <th className="px-3 py-2 text-end font-medium">{t("columnPoints")}</th>
            </tr>
          </thead>
          <tbody>
            {LETTER_GRADES.map((grade) => (
              <tr key={grade} className="border-t border-zinc-100 dark:border-zinc-800/60">
                <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-zinc-100">{grade}</td>
                <td className="px-3 py-2 text-end font-mono text-zinc-700 dark:text-zinc-300">
                  {GRADE_POINTS[grade].toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
