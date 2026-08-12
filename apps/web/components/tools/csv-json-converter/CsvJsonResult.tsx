"use client";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import DownloadButton from "@/components/tool-ui/DownloadButton";

type CsvJsonResultProps = {
  result: string;
  errorMessage: string;
  isEmpty: boolean;
  filename: string;
  mimeType: string;
};

export default function CsvJsonResult({ result, errorMessage, isEmpty, filename, mimeType }: CsvJsonResultProps) {
  const t = useTranslations("tools.csv-json-converter");

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      {isEmpty ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      ) : errorMessage ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-end gap-2">
            <CopyButton text={result} className="px-3 py-2 text-xs" />
            <DownloadButton content={result} filename={filename} mimeType={mimeType} className="px-3 py-2 text-xs" />
          </div>
          <textarea
            readOnly
            value={result}
            rows={12}
            dir="ltr"
            spellCheck={false}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </>
      )}
    </SectionCard>
  );
}
