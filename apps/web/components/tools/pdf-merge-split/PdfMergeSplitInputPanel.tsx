"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload, X, GripVertical } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

export type PdfMode = "merge" | "split";

type FileEntry = { file: File; id: string };

type PdfMergeSplitInputPanelProps = {
  mode: PdfMode;
  onModeChange: (mode: PdfMode) => void;
  mergeFiles: FileEntry[];
  onMergeFilesAdd: (files: FileList) => void;
  onMergeFileRemove: (id: string) => void;
  onMergeFileMove: (id: string, direction: "up" | "down") => void;
  splitFile: File | null;
  onSplitFileSelect: (file: File) => void;
  splitPageCount: number | null;
  rangesInput: string;
  onRangesInputChange: (value: string) => void;
  error: string;
};

export default function PdfMergeSplitInputPanel({
  mode,
  onModeChange,
  mergeFiles,
  onMergeFilesAdd,
  onMergeFileRemove,
  onMergeFileMove,
  splitFile,
  onSplitFileSelect,
  splitPageCount,
  rangesInput,
  onRangesInputChange,
  error,
}: PdfMergeSplitInputPanelProps) {
  const t = useTranslations("tools.pdf-merge-split");
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const splitInputRef = useRef<HTMLInputElement>(null);

  return (
    <SectionCard title={t("form.inputTitle")}>
      <div className="mb-4 flex gap-3">
        {(["merge", "split"] as const).map((value) => (
          <label
            key={value}
            className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition ${
              mode === value
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            <input type="radio" name="pdf-mode" value={value} checked={mode === value} onChange={() => onModeChange(value)} className="sr-only" />
            {value === "merge" ? t("form.modeMerge") : t("form.modeSplit")}
          </label>
        ))}
      </div>

      {mode === "merge" ? (
        <div>
          <input
            ref={mergeInputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => e.target.files && onMergeFilesAdd(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => mergeInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) onMergeFilesAdd(e.dataTransfer.files);
            }}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 px-6 py-8 text-center transition hover:border-blue-400 dark:border-zinc-700 dark:hover:border-blue-500"
          >
            <Upload size={24} className="text-zinc-400 dark:text-zinc-500" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t("form.chooseFiles")}</span>
          </button>

          {mergeFiles.length > 0 && (
            <ul className="mt-4 space-y-2">
              {mergeFiles.map((entry, index) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60"
                >
                  <GripVertical size={14} className="shrink-0 text-zinc-400" />
                  <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">
                    {index + 1}. {entry.file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onMergeFileMove(entry.id, "up")}
                    disabled={index === 0}
                    className="rounded px-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-200"
                    aria-label={t("form.moveUp")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onMergeFileMove(entry.id, "down")}
                    disabled={index === mergeFiles.length - 1}
                    className="rounded px-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-200"
                    aria-label={t("form.moveDown")}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onMergeFileRemove(entry.id)}
                    className="rounded px-1 text-red-500 hover:text-red-700"
                    aria-label={t("form.remove")}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={splitInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => e.target.files?.[0] && onSplitFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => splitInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) onSplitFileSelect(dropped);
            }}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 px-6 py-8 text-center transition hover:border-blue-400 dark:border-zinc-700 dark:hover:border-blue-500"
          >
            <Upload size={24} className="text-zinc-400 dark:text-zinc-500" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {splitFile ? splitFile.name : t("form.chooseFile")}
            </span>
            {splitPageCount !== null && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">{t("form.pageCount", { count: splitPageCount })}</span>
            )}
          </button>

          {splitFile && (
            <div className="mt-4">
              <ToolInput
                label={t("form.rangesLabel")}
                hint={t("form.rangesHint")}
                type="text"
                dir="ltr"
                placeholder={t("form.rangesPlaceholder")}
                value={rangesInput}
                onChange={(e) => onRangesInputChange(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}
    </SectionCard>
  );
}
