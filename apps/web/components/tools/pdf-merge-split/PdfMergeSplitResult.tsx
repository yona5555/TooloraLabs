"use client";
import { useTranslations } from "next-intl";
import { Download, FileText, Loader2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { PdfMode } from "./PdfMergeSplitInputPanel";
import PdfMergeSplitShareExportModal from "./PdfMergeSplitShareExportModal";

type PdfMergeSplitResultProps = {
  mode: PdfMode;
  isProcessing: boolean;
  resultReady: boolean;
  resultCount: number;
  inputFileCount: number;
  onDownload: () => void;
};

export default function PdfMergeSplitResult({ mode, isProcessing, resultReady, resultCount, inputFileCount, onDownload }: PdfMergeSplitResultProps) {
  const t = useTranslations("tools.pdf-merge-split");
  const tRoot = t;

  const heroValue =
    mode === "merge" ? t("aboveFold.mergeReady") : t("aboveFold.splitReady", { count: resultCount });

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        resultReady ? (
          <PdfMergeSplitShareExportModal
            inputRows={[{ label: tRoot("shareExport.inputFileCountLabel"), value: String(inputFileCount) }]}
            heroLabel={t("aboveFold.resultTitle")}
            heroValue={heroValue}
            sentence={tRoot("shareExport.sentence", { mode, count: resultCount, inputCount: inputFileCount })}
          />
        ) : undefined
      }
    >
      {isProcessing ? (
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
          <Loader2 size={24} className="animate-spin" />
          {t("aboveFold.processing")}
        </div>
      ) : resultReady ? (
        <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
          <FileText size={40} className="text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {mode === "merge" ? t("aboveFold.mergeReady") : t("aboveFold.splitReady", { count: resultCount })}
          </p>
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Download size={16} />
            {mode === "merge" ? t("aboveFold.downloadMerged") : t("aboveFold.downloadZip")}
          </button>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {mode === "merge" ? t("aboveFold.placeholderMerge") : t("aboveFold.placeholderSplit")}
        </p>
      )}
    </SectionCard>
  );
}
