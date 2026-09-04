"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import NotepadShareExportModal from "./NotepadShareExportModal";
import type { NotepadResult as Result } from "./types";

type Props = {
  result: Result;
};

export default function NotepadResult({ result }: Props) {
  const t = useTranslations("tools.notepad-calculator.result");

  const calculatedCount = result.lines.filter((line) => line.result !== null).length;
  const hasAnyCalculation = calculatedCount > 0;

  return (
    <SectionCard title={t("heading")} action={hasAnyCalculation ? <NotepadShareExportModal result={result} /> : undefined}>
      {!hasAnyCalculation ? (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("noCalculations")}</p>
      ) : (
        <>
          <p className="mb-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {t("calculatedCount", { count: calculatedCount })}
          </p>
          <ol className="divide-y divide-zinc-100 font-mono text-sm dark:divide-zinc-800">
            {result.lines.map((line, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-1.5">
                <span dir="auto" className="truncate text-zinc-700 dark:text-zinc-200">
                  {line.text || " "}
                </span>
                {line.result !== null && (
                  <span dir="ltr" className="shrink-0 font-semibold text-blue-600 dark:text-blue-400">
                    {line.result}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </SectionCard>
  );
}
