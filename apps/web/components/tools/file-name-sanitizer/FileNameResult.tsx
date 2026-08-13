"use client";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { SanitizerChangeCode } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";

type FileNameResultProps = {
  result: string;
  errorMessage: string;
  changes: SanitizerChangeCode[];
};

export default function FileNameResult({ result, errorMessage, changes }: FileNameResultProps) {
  const t = useTranslations("tools.file-name-sanitizer");

  return (
    <SectionCard title={t("aboveFold.resultTitle")} action={result ? <CopyButton text={result} /> : undefined}>
      {errorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage}
        </p>
      ) : result ? (
        <>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800">
            <code dir="ltr" className="block break-all text-center font-mono text-lg text-zinc-900 dark:text-zinc-100">
              {result}
            </code>
          </div>

          {changes.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t("aboveFold.changesTitle")}
              </p>
              <ul className="space-y-1.5">
                {changes.map((code) => (
                  <li key={code} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    {t(`aboveFold.changeLabels.${code}`)}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.noChanges")}</p>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
